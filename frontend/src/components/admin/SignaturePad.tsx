import { useEffect, useRef, useState } from 'react'
import { Eraser, PenLine } from 'lucide-react'

interface Props {
  value: string | null
  onChange: (dataUrl: string | null) => void
  label?: string
}

export function SignaturePad({ value, onChange, label = 'Firma' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(!!value)

  // Inicializo canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set actual pixel dimensions
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.scale(dpr, dpr)
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#0F1417'

    // Nëse ka value ekzistues, ngarko
    if (value) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height)
      }
      img.src = value
    }
  }, []) // vetëm një herë

  function getCoords(e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()

    if ('touches' in e) {
      const touch = e.touches[0] ?? e.changedTouches[0]
      if (!touch) return null
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
    }

    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function startDrawing(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    const coords = getCoords(e)
    if (!coords) return

    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(coords.x, coords.y)
    setIsDrawing(true)
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    if (!isDrawing) return
    const coords = getCoords(e)
    if (!coords) return

    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    ctx.lineTo(coords.x, coords.y)
    ctx.stroke()
    setHasDrawn(true)
  }

  function stopDrawing(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    if (!isDrawing) return
    setIsDrawing(false)

    // Ruaj si data URL
    const canvas = canvasRef.current
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png')
      onChange(dataUrl)
    }
  }

  function clear() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const rect = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)
    setHasDrawn(false)
    onChange(null)
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-sm font-medium text-ink">
          <PenLine className="h-4 w-4 text-muted" />
          {label}
        </label>
        {hasDrawn && (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink"
          >
            <Eraser className="h-3.5 w-3.5" />
            Fshij
          </button>
        )}
      </div>

      <div className="relative rounded-lg border-2 border-dashed border-line bg-white">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="block w-full touch-none cursor-crosshair rounded-lg"
          style={{ height: 180 }}
        />

        {!hasDrawn && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-muted">Vizato firmën këtu</p>
          </div>
        )}
      </div>
      <p className="mt-1.5 text-xs text-muted">
        {hasDrawn ? 'Firma u regjistrua' : 'Vizato me mouse ose gisht'}
      </p>
    </div>
  )
}
