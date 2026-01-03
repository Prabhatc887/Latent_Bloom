import { WavHeaderOptions } from '../types';

/**
 * Concatenates two ArrayBuffers
 */
function appendBuffer(buffer1: ArrayBuffer, buffer2: ArrayBuffer): ArrayBuffer {
  const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  return tmp.buffer;
}

/**
 * Creates a standard WAV header for PCM data.
 * Essential because Gemini returns raw PCM, which browsers cannot play or download directly as a file.
 */
function createWavHeader(dataLength: number, options: WavHeaderOptions): ArrayBuffer {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true); // ChunkSize
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, options.numChannels, true); // NumChannels
  view.setUint32(24, options.sampleRate, true); // SampleRate
  view.setUint32(28, options.sampleRate * options.numChannels * (options.bitsPerSample / 8), true); // ByteRate
  view.setUint16(32, options.numChannels * (options.bitsPerSample / 8), true); // BlockAlign
  view.setUint16(34, options.bitsPerSample, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true); // Subchunk2Size

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Converts a Base64 string of raw PCM 16-bit audio to a WAV Blob.
 */
export function pcmBase64ToWavBlob(base64: string, sampleRate: number = 24000): Blob {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Gemini usually sends 16-bit PCM (Linear16).
  // The byte length represents raw data.
  const wavHeader = createWavHeader(bytes.length, {
    sampleRate: sampleRate,
    numChannels: 1, // Gemini TTS is typically mono
    bitsPerSample: 16,
  });

  const wavBuffer = appendBuffer(wavHeader, bytes.buffer);
  return new Blob([wavBuffer], { type: 'audio/wav' });
}