Pod::Spec.new do |s|
  s.name           = 'AudioDetectionModule'
  s.version        = '1.0.0'
  s.summary        = 'Audio detection module for Real Guitar Hero'
  s.description    = 'Native iOS module for real-time polyphonic audio detection using AVAudioEngine and Accelerate framework FFT'
  s.homepage       = 'https://github.com/realguitarhero/audio-detection'
  s.license        = { :type => 'MIT' }
  s.author         = { 'Real Guitar Hero' => 'dev@realguitarhero.app' }
  s.platforms      = { :ios => '14.0' }
  s.source         = { :git => 'local', :tag => s.version.to_s }
  s.source_files   = '**/*.{swift,h,m,mm}'
  s.swift_version  = '5.0'

  s.frameworks     = 'AVFoundation', 'Accelerate'

  s.dependency     'ExpoModulesCore'
end
