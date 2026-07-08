'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Camera, AlertCircle } from 'lucide-react'

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void
  onClose:    () => void
}

/**
 * Escáner de código de barras con html5-qrcode.
 * Requiere: npm install html5-qrcode
 *
 * Se carga de forma lazy (dynamic import) para no romper el build si la
 * dependencia todavía no está instalada — en ese caso muestra un mensaje claro.
 */
export default function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const regionId = 'barcode-scanner-region'
  const scannerRef = useRef<any>(null)
  const [status, setStatus] = useState<'loading' | 'scanning' | 'error' | 'missing-dep'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        // Carga dinámica: si la dependencia no existe lanza un error de módulo
        const { Html5Qrcode } = await import('html5-qrcode').catch(() => {
          throw new Error('MISSING_DEP')
        })

        if (!mounted) return
        const scanner = new Html5Qrcode(regionId)
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 120 } },
          (decodedText: string) => {
            onDetected(decodedText)
            scanner.stop().catch(() => {})
          },
          () => {}, // onError — silencioso mientras escanea
        )
        if (mounted) setStatus('scanning')
      } catch (err: any) {
        if (!mounted) return
        if (err.message === 'MISSING_DEP') {
          setStatus('missing-dep')
        } else {
          setStatus('error')
          setErrorMsg(
            err.name === 'NotAllowedError'
              ? 'Camera permission denied. Allow access in your browser settings.'
              : 'Could not start camera. Make sure no other app is using it.',
          )
        }
      }
    }

    init()
    return () => {
      mounted = false
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-surface border border-border rounded-2xl overflow-hidden w-full max-w-sm space-y-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 text-sm font-semibold text-text">
            <Camera size={16} className="text-primary" /> Scan Barcode
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Scanner area */}
        <div className="relative bg-black">
          <div id={regionId} className="w-full" style={{ minHeight: 240 }} />
          {status === 'scanning' && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none">
              <div className="w-64 h-28 border-2 border-primary rounded-lg relative">
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary/70 animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* State messages */}
        <div className="px-4 py-3 text-center">
          {status === 'loading' && (
            <p className="text-xs text-text-muted animate-pulse">Starting camera…</p>
          )}
          {status === 'scanning' && (
            <p className="text-xs text-text-muted">Point camera at a barcode</p>
          )}
          {status === 'error' && (
            <div className="flex items-start gap-2 text-left">
              <AlertCircle size={14} className="text-error shrink-0 mt-0.5" />
              <p className="text-xs text-error">{errorMsg}</p>
            </div>
          )}
          {status === 'missing-dep' && (
            <div className="space-y-2 text-left">
              <p className="text-xs text-orange-400 font-medium">Dependency not installed</p>
              <p className="text-xs text-text-muted">
                Run <code className="bg-surface-2 px-1 rounded text-primary">npm install html5-qrcode</code> in the frontend project to enable barcode scanning.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
