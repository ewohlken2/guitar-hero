package com.guitarslam.audiodetection

import android.Manifest
import android.content.pm.PackageManager
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.Bundle
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.coroutines.isActive
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.ln
import kotlin.math.pow
import kotlin.math.sin
import kotlin.math.sqrt

/**
 * Android native audio detection module for Real Guitar Hero
 *
 * Uses AudioRecord for microphone input and FFT processing to detect pitches
 * and emit detected pitch events to JavaScript.
 */
class AudioDetectionModule : Module() {

    companion object {
        // Audio recording configuration
        private const val SAMPLE_RATE = 44100
        private const val CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO
        private const val AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT

        // FFT configuration
        private const val FFT_SIZE = 4096
        private const val MIN_FREQUENCY = 60.0   // Below E2 (guitar low E)
        private const val MAX_FREQUENCY = 1500.0 // Above E6
        private const val MIN_CONFIDENCE = 0.3   // Minimum confidence threshold

        // Reference frequency for A4
        private const val A4_FREQUENCY = 440.0

        // Note names for pitch class calculation
        private val NOTE_NAMES = arrayOf("C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B")
    }

    private var audioRecord: AudioRecord? = null
    private var recordingJob: Job? = null
    private var isListening = false
    private val scope = CoroutineScope(Dispatchers.Default)

    // Pre-allocated buffers for FFT processing
    private val audioBuffer = ShortArray(FFT_SIZE)
    private val fftReal = DoubleArray(FFT_SIZE)
    private val fftImag = DoubleArray(FFT_SIZE)
    private val magnitudes = DoubleArray(FFT_SIZE / 2)
    private val hannWindow = DoubleArray(FFT_SIZE)

    init {
        // Pre-compute Hann window
        for (i in 0 until FFT_SIZE) {
            hannWindow[i] = 0.5 * (1 - cos(2.0 * PI * i / (FFT_SIZE - 1)))
        }
    }

    override fun definition() = ModuleDefinition {
        Name("AudioDetectionModule")

        // Define events that can be sent to JavaScript
        Events("onDetectedPitches")

        // Start listening to microphone input
        AsyncFunction("startListening") {
            startAudioCapture()
        }

        // Stop listening to microphone input
        AsyncFunction("stopListening") {
            stopAudioCapture()
        }

        // Check if currently listening
        Function("isListening") {
            isListening
        }

        // Clean up when module is destroyed
        OnDestroy {
            stopAudioCapture()
        }
    }

    private fun startAudioCapture() {
        if (isListening) return

        val context = appContext.reactContext ?: return

        // Check for audio permission
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO)
            != PackageManager.PERMISSION_GRANTED) {
            throw AudioDetectionException("RECORD_AUDIO permission not granted")
        }

        val bufferSize = AudioRecord.getMinBufferSize(SAMPLE_RATE, CHANNEL_CONFIG, AUDIO_FORMAT)
        if (bufferSize == AudioRecord.ERROR || bufferSize == AudioRecord.ERROR_BAD_VALUE) {
            throw AudioDetectionException("Unable to get valid buffer size")
        }

        try {
            audioRecord = AudioRecord(
                MediaRecorder.AudioSource.MIC,
                SAMPLE_RATE,
                CHANNEL_CONFIG,
                AUDIO_FORMAT,
                maxOf(bufferSize, FFT_SIZE * 2)
            )

            if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
                audioRecord?.release()
                audioRecord = null
                throw AudioDetectionException("AudioRecord failed to initialize")
            }

            audioRecord?.startRecording()
            isListening = true

            // Start processing audio in a coroutine
            recordingJob = scope.launch {
                processAudioLoop()
            }

        } catch (e: SecurityException) {
            throw AudioDetectionException("Security exception: ${e.message}")
        }
    }

    private fun stopAudioCapture() {
        isListening = false
        recordingJob?.cancel()
        recordingJob = null

        audioRecord?.let { record ->
            try {
                if (record.recordingState == AudioRecord.RECORDSTATE_RECORDING) {
                    record.stop()
                }
                record.release()
            } catch (e: Exception) {
                // Ignore errors during cleanup
            }
        }
        audioRecord = null
    }

    private suspend fun processAudioLoop() {
        while (isListening && recordingJob?.isActive == true) {
            val record = audioRecord ?: break

            // Read audio samples
            val samplesRead = record.read(audioBuffer, 0, FFT_SIZE)
            if (samplesRead <= 0) continue

            // Apply Hann window and convert to double
            for (i in 0 until FFT_SIZE) {
                fftReal[i] = if (i < samplesRead) {
                    audioBuffer[i].toDouble() * hannWindow[i] / 32768.0
                } else {
                    0.0
                }
                fftImag[i] = 0.0
            }

            // Perform FFT
            fft(fftReal, fftImag)

            // Calculate magnitudes
            var maxMagnitude = 0.0
            for (i in 0 until FFT_SIZE / 2) {
                magnitudes[i] = sqrt(fftReal[i] * fftReal[i] + fftImag[i] * fftImag[i])
                if (magnitudes[i] > maxMagnitude) {
                    maxMagnitude = magnitudes[i]
                }
            }

            // Normalize magnitudes
            if (maxMagnitude > 0) {
                for (i in 0 until FFT_SIZE / 2) {
                    magnitudes[i] /= maxMagnitude
                }
            }

            // Detect pitches
            val detectedPitches = detectPitches()

            // Emit event if pitches were detected
            if (detectedPitches.isNotEmpty()) {
                emitPitchEvent(detectedPitches)
            }
        }
    }

    /**
     * Detect pitches from the magnitude spectrum using peak picking
     */
    private fun detectPitches(): List<DetectedPitch> {
        val pitches = mutableListOf<DetectedPitch>()
        val frequencyResolution = SAMPLE_RATE.toDouble() / FFT_SIZE

        // Find the bin range for our frequency of interest
        val minBin = (MIN_FREQUENCY / frequencyResolution).toInt().coerceAtLeast(1)
        val maxBin = (MAX_FREQUENCY / frequencyResolution).toInt().coerceAtMost(FFT_SIZE / 2 - 1)

        // Find local maxima (peaks)
        for (i in minBin until maxBin) {
            if (magnitudes[i] > magnitudes[i - 1] &&
                magnitudes[i] > magnitudes[i + 1] &&
                magnitudes[i] > MIN_CONFIDENCE) {

                // Parabolic interpolation for better frequency estimate
                val alpha = magnitudes[i - 1]
                val beta = magnitudes[i]
                val gamma = magnitudes[i + 1]

                val p = 0.5 * (alpha - gamma) / (alpha - 2 * beta + gamma)
                val interpolatedBin = i + p
                val frequency = interpolatedBin * frequencyResolution

                // Calculate pitch class
                val (note, octave) = frequencyToNote(frequency)
                val confidence = magnitudes[i]

                pitches.add(DetectedPitch(
                    note = "$note$octave",
                    frequency = frequency,
                    confidence = confidence
                ))
            }
        }

        // Sort by confidence and return top pitches
        return pitches.sortedByDescending { it.confidence }.take(5)
    }

    /**
     * Convert frequency to note name and octave
     */
    private fun frequencyToNote(frequency: Double): Pair<String, Int> {
        // Calculate semitones from A4
        val semitones = 12 * ln(frequency / A4_FREQUENCY) / ln(2.0)

        // A4 is at index 9 (A is the 10th note: C, C#, D, D#, E, F, F#, G, G#, A)
        val noteIndex = ((semitones + 9 + 12000) % 12).toInt()

        // Calculate octave (A4 = 440Hz is in octave 4)
        val octave = ((semitones + 9) / 12 + 4).toInt()

        return Pair(NOTE_NAMES[noteIndex], octave)
    }

    /**
     * Emit detected pitches to JavaScript
     */
    private fun emitPitchEvent(pitches: List<DetectedPitch>) {
        val pitchesArray = pitches.map { pitch ->
            mapOf(
                "note" to pitch.note,
                "frequency" to pitch.frequency,
                "confidence" to pitch.confidence
            )
        }

        sendEvent("onDetectedPitches", mapOf(
            "pitches" to pitchesArray,
            "timestamp" to System.currentTimeMillis()
        ))
    }

    /**
     * In-place Cooley-Tukey FFT implementation
     * Based on JTransforms library algorithm style
     */
    private fun fft(real: DoubleArray, imag: DoubleArray) {
        val n = real.size

        // Bit reversal permutation
        var j = 0
        for (i in 0 until n - 1) {
            if (i < j) {
                var temp = real[i]
                real[i] = real[j]
                real[j] = temp
                temp = imag[i]
                imag[i] = imag[j]
                imag[j] = temp
            }
            var k = n / 2
            while (k <= j) {
                j -= k
                k /= 2
            }
            j += k
        }

        // Cooley-Tukey iterative FFT
        var step = 1
        while (step < n) {
            val halfStep = step
            step *= 2

            val angle = -PI / halfStep
            val wReal = cos(angle)
            val wImag = sin(angle)

            for (group in 0 until n step step) {
                var wr = 1.0
                var wi = 0.0

                for (pair in 0 until halfStep) {
                    val i = group + pair
                    val iHalf = i + halfStep

                    val tempReal = wr * real[iHalf] - wi * imag[iHalf]
                    val tempImag = wr * imag[iHalf] + wi * real[iHalf]

                    real[iHalf] = real[i] - tempReal
                    imag[iHalf] = imag[i] - tempImag
                    real[i] = real[i] + tempReal
                    imag[i] = imag[i] + tempImag

                    // Update twiddle factor
                    val tempW = wr * wReal - wi * wImag
                    wi = wr * wImag + wi * wReal
                    wr = tempW
                }
            }
        }
    }

    /**
     * Data class for detected pitch information
     */
    private data class DetectedPitch(
        val note: String,
        val frequency: Double,
        val confidence: Double
    )
}

/**
 * Custom exception for audio detection errors
 */
class AudioDetectionException(message: String) : Exception(message)
