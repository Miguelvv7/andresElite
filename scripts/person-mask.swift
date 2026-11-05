// Genera una máscara en escala de grises (blanco = persona) con el detector de macOS.
// Uso: swift scripts/person-mask.swift entrada.jpg salida.png
import AppKit
import CoreImage
import Vision

let arguments = CommandLine.arguments
guard arguments.count == 3 else { fatalError("Uso: person-mask.swift entrada salida") }

let input = URL(fileURLWithPath: arguments[1])
let output = URL(fileURLWithPath: arguments[2])
guard let image = CIImage(contentsOf: input, options: [.applyOrientationProperty: true]) else {
  fatalError("No se puede leer \(input.path)")
}

let request = VNGeneratePersonSegmentationRequest()
request.qualityLevel = .accurate
request.outputPixelFormat = kCVPixelFormatType_OneComponent8
try VNImageRequestHandler(ciImage: image).perform([request])
guard let mask = request.results?.first?.pixelBuffer else { fatalError("No se detecta ninguna persona") }

// La máscara sale a menor resolución: se lleva al tamaño de la foto con Lanczos.
let matte = CIImage(cvPixelBuffer: mask)
let scale = CIFilter(name: "CILanczosScaleTransform")!
scale.setValue(matte, forKey: kCIInputImageKey)
scale.setValue(image.extent.height / matte.extent.height, forKey: kCIInputScaleKey)
scale.setValue(
  (image.extent.width / matte.extent.width) / (image.extent.height / matte.extent.height),
  forKey: kCIInputAspectRatioKey)

let context = CIContext()
try context.writePNGRepresentation(
  of: scale.outputImage!.cropped(to: image.extent),
  to: output,
  format: .L8,
  colorSpace: CGColorSpace(name: CGColorSpace.linearGray)!)
