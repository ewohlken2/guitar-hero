import ExpoModulesCore
import AVFoundation

public class AudioDetectionModule: Module {
  private let engine = AVAudioEngine()
  private let processor = CQTProcessor()
  private var isListening = false

  public func definition() -> ModuleDefinition {
    Name("AudioDetectionModule")

    Events("onDetectedPitches")

    Function("startListening") { [weak self] in
      self?.startEngine()
    }

    Function("stopListening") { [weak self] in
      self?.stopEngine()
    }
  }

  private func startEngine() {
    guard !isListening else { return }

    // Request microphone permission
    AVAudioSession.sharedInstance().requestRecordPermission { [weak self] granted in
      guard granted else {
        print("AudioDetectionModule: Microphone permission denied")
        return
      }

      DispatchQueue.main.async {
        self?.setupAndStartEngine()
      }
    }
  }

  private func setupAndStartEngine() {
    do {
      let session = AVAudioSession.sharedInstance()
      try session.setCategory(.playAndRecord, mode: .measurement, options: [.defaultToSpeaker, .allowBluetooth])
      try session.setActive(true)

      let input = engine.inputNode
      let format = input.outputFormat(forBus: 0)

      // Validate format
      guard format.sampleRate > 0 else {
        print("AudioDetectionModule: Invalid audio format")
        return
      }

      input.installTap(onBus: 0, bufferSize: 4096, format: format) { [weak self] buffer, time in
        guard let self = self else { return }
        let result = self.processor.process(buffer: buffer, sampleRate: format.sampleRate)

        // Only emit if we have detected pitches
        if !result.pitches.isEmpty {
          self.sendEvent("onDetectedPitches", [
            "pitches": result.pitches.map { [
              "note": $0.note,
              "frequency": $0.frequency,
              "confidence": $0.confidence
            ] },
            "timestamp": result.timestamp
          ])
        }
      }

      try engine.start()
      isListening = true
      print("AudioDetectionModule: Started listening")
    } catch {
      print("AudioDetectionModule: Failed to start engine - \(error.localizedDescription)")
    }
  }

  private func stopEngine() {
    guard isListening else { return }

    engine.inputNode.removeTap(onBus: 0)
    engine.stop()
    isListening = false
    print("AudioDetectionModule: Stopped listening")
  }
}
