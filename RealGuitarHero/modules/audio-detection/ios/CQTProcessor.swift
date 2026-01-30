import AVFoundation
import Accelerate

/// Represents a detected musical pitch
struct DetectedPitch {
  let note: String
  let frequency: Double
  let confidence: Double
}

/// Result from CQT processing containing detected pitches
struct CQTResult {
  let pitches: [DetectedPitch]
  let timestamp: Double
}

/// Processes audio buffers using FFT to detect musical pitches
/// Uses Apple's Accelerate framework for efficient DSP operations
final class CQTProcessor {
  // Guitar frequency range: E2 (82.41 Hz) to E5 (659.26 Hz)
  private let minFrequency: Double = 82.41
  private let maxFrequency: Double = 659.26

  // Minimum magnitude threshold to consider a frequency bin as containing a pitch
  private let magnitudeThreshold: Float = 0.01

  // Maximum number of pitches to return (guitar has 6 strings)
  private let maxPitches = 6

  // FFT setup (reused across calls for efficiency)
  private var fftSetup: FFTSetup?
  private let fftSize: Int = 4096

  // Note names for pitch class conversion
  private let noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

  init() {
    // Create FFT setup once for reuse
    let log2n = vDSP_Length(log2(Float(fftSize)))
    fftSetup = vDSP_create_fftsetup(log2n, Int32(kFFTRadix2))
  }

  deinit {
    if let setup = fftSetup {
      vDSP_destroy_fftsetup(setup)
    }
  }

  /// Process an audio buffer and return detected pitches
  /// - Parameters:
  ///   - buffer: The audio buffer from AVAudioEngine tap
  ///   - sampleRate: The sample rate of the audio
  /// - Returns: CQTResult containing detected pitches and timestamp
  func process(buffer: AVAudioPCMBuffer, sampleRate: Double) -> CQTResult {
    guard let channelData = buffer.floatChannelData?[0] else {
      return CQTResult(pitches: [], timestamp: Date().timeIntervalSince1970)
    }

    let frameCount = min(Int(buffer.frameLength), fftSize)
    guard frameCount > 0 else {
      return CQTResult(pitches: [], timestamp: Date().timeIntervalSince1970)
    }

    // Apply Hanning window to reduce spectral leakage
    var windowed = [Float](repeating: 0, count: fftSize)
    var window = [Float](repeating: 0, count: frameCount)
    vDSP_hann_window(&window, vDSP_Length(frameCount), Int32(vDSP_HANN_NORM))

    // Multiply input by window
    vDSP_vmul(channelData, 1, window, 1, &windowed, 1, vDSP_Length(frameCount))

    // Zero-pad if necessary
    if frameCount < fftSize {
      for i in frameCount..<fftSize {
        windowed[i] = 0
      }
    }

    // Prepare for FFT - split complex format
    var real = [Float](repeating: 0, count: fftSize / 2)
    var imag = [Float](repeating: 0, count: fftSize / 2)

    // Convert to split complex format
    windowed.withUnsafeBufferPointer { windowedPtr in
      var splitComplex = DSPSplitComplex(realp: &real, imagp: &imag)
      windowedPtr.baseAddress!.withMemoryRebound(to: DSPComplex.self, capacity: fftSize / 2) { complexPtr in
        vDSP_ctoz(complexPtr, 2, &splitComplex, 1, vDSP_Length(fftSize / 2))
      }
    }

    // Perform FFT
    guard let setup = fftSetup else {
      return CQTResult(pitches: [], timestamp: Date().timeIntervalSince1970)
    }

    var splitComplex = DSPSplitComplex(realp: &real, imagp: &imag)
    let log2n = vDSP_Length(log2(Float(fftSize)))
    vDSP_fft_zrip(setup, &splitComplex, 1, log2n, FFTDirection(FFT_FORWARD))

    // Calculate magnitudes
    var magnitudes = [Float](repeating: 0, count: fftSize / 2)
    vDSP_zvmags(&splitComplex, 1, &magnitudes, 1, vDSP_Length(fftSize / 2))

    // Normalize magnitudes
    var scale = Float(1.0 / Float(fftSize))
    vDSP_vsmul(magnitudes, 1, &scale, &magnitudes, 1, vDSP_Length(fftSize / 2))

    // Find pitches from frequency bins
    let pitches = estimatePitches(from: magnitudes, sampleRate: sampleRate)
    return CQTResult(pitches: pitches, timestamp: Date().timeIntervalSince1970)
  }

  /// Estimate pitches from FFT magnitude spectrum
  private func estimatePitches(from magnitudes: [Float], sampleRate: Double) -> [DetectedPitch] {
    var candidates: [DetectedPitch] = []
    let binWidth = sampleRate / Double(fftSize)

    // Find local maxima (peaks) in the magnitude spectrum
    for bin in 1..<(magnitudes.count - 1) {
      let frequency = Double(bin) * binWidth

      // Skip frequencies outside guitar range
      guard frequency >= minFrequency && frequency <= maxFrequency else { continue }

      let magnitude = magnitudes[bin]

      // Check if this is a local maximum and above threshold
      guard magnitude > magnitudeThreshold,
            magnitude > magnitudes[bin - 1],
            magnitude > magnitudes[bin + 1] else { continue }

      // Use parabolic interpolation for more accurate frequency estimation
      let alpha = magnitudes[bin - 1]
      let beta = magnitude
      let gamma = magnitudes[bin + 1]

      let denominator = alpha - 2 * beta + gamma
      var refinedBin = Double(bin)
      if abs(denominator) > 1e-10 {
        let delta = 0.5 * Double(alpha - gamma) / Double(denominator)
        refinedBin += delta
      }

      let refinedFrequency = refinedBin * binWidth
      let note = pitchClass(for: refinedFrequency)
      let confidence = normalizeConfidence(Double(magnitude))

      candidates.append(DetectedPitch(
        note: note,
        frequency: refinedFrequency,
        confidence: confidence
      ))
    }

    // Sort by confidence and take top pitches
    let sortedPitches = candidates
      .sorted { $0.confidence > $1.confidence }
      .prefix(maxPitches)

    // Remove duplicate notes (keep highest confidence for each note)
    var seenNotes = Set<String>()
    var uniquePitches: [DetectedPitch] = []
    for pitch in sortedPitches {
      if !seenNotes.contains(pitch.note) {
        seenNotes.insert(pitch.note)
        uniquePitches.append(pitch)
      }
    }

    return uniquePitches
  }

  /// Convert frequency to pitch class name
  private func pitchClass(for frequency: Double) -> String {
    let a4: Double = 440.0
    let semitones = 12.0 * log2(frequency / a4)
    let index = Int(round(semitones)) + 9 // A is at index 9
    let normalizedIndex = ((index % 12) + 12) % 12
    return noteNames[normalizedIndex]
  }

  /// Normalize magnitude to 0-1 confidence range
  private func normalizeConfidence(_ magnitude: Double) -> Double {
    // Use logarithmic scaling for better perceptual mapping
    let logMagnitude = log10(magnitude + 1e-10)
    let normalized = (logMagnitude + 5) / 5 // Assuming magnitudes in range 1e-5 to 1
    return min(1.0, max(0.0, normalized))
  }
}
