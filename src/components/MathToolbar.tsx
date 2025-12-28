import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronDown } from 'react-icons/fi'

interface MathToolbarProps {
  onInsert: (latex: string) => void
  isDark?: boolean
}

// Math symbol categories
const mathCategories = [
  {
    name: 'Asosiy',
    symbols: [
      { label: '+', latex: '+', title: "Qo'shish" },
      { label: '-', latex: '-', title: 'Ayirish' },
      { label: '×', latex: '\\times', title: "Ko'paytirish" },
      { label: '÷', latex: '\\div', title: "Bo'lish" },
      { label: '±', latex: '\\pm', title: 'Plus-minus' },
      { label: '=', latex: '=', title: 'Teng' },
      { label: '≠', latex: '\\neq', title: 'Teng emas' },
      { label: '≈', latex: '\\approx', title: 'Taxminan teng' },
      { label: '<', latex: '<', title: 'Kichik' },
      { label: '>', latex: '>', title: 'Katta' },
      { label: '≤', latex: '\\leq', title: 'Kichik yoki teng' },
      { label: '≥', latex: '\\geq', title: 'Katta yoki teng' },
    ],
  },
  {
    name: 'Kasr va daraja',
    symbols: [
      { label: 'a/b', latex: '\\frac{a}{b}', title: 'Kasr' },
      { label: 'a²', latex: 'a^{2}', title: 'Kvadrat' },
      { label: 'aⁿ', latex: 'a^{n}', title: 'Daraja' },
      { label: '√', latex: '\\sqrt{x}', title: 'Kvadrat ildiz' },
      { label: '∛', latex: '\\sqrt[3]{x}', title: 'Kub ildiz' },
      { label: 'ⁿ√', latex: '\\sqrt[n]{x}', title: 'n-chi ildiz' },
      { label: 'a₁', latex: 'a_{1}', title: 'Indeks' },
      { label: '|x|', latex: '|x|', title: 'Modul' },
    ],
  },
  {
    name: 'Trigonometriya',
    symbols: [
      { label: 'sin', latex: '\\sin', title: 'Sinus' },
      { label: 'cos', latex: '\\cos', title: 'Kosinus' },
      { label: 'tan', latex: '\\tan', title: 'Tangens' },
      { label: 'cot', latex: '\\cot', title: 'Kotangens' },
      { label: 'sin⁻¹', latex: '\\arcsin', title: 'Arksinus' },
      { label: 'cos⁻¹', latex: '\\arccos', title: 'Arkkosinus' },
      { label: 'tan⁻¹', latex: '\\arctan', title: 'Arktangens' },
      { label: 'π', latex: '\\pi', title: 'Pi' },
      { label: '°', latex: '^{\\circ}', title: 'Gradus' },
    ],
  },
  {
    name: 'Logarifm',
    symbols: [
      { label: 'log', latex: '\\log', title: 'Logarifm' },
      { label: 'ln', latex: '\\ln', title: 'Natural logarifm' },
      { label: 'logₐ', latex: '\\log_{a}', title: 'Asosli logarifm' },
      { label: 'e', latex: 'e', title: 'Eyler soni' },
      { label: 'eˣ', latex: 'e^{x}', title: "e ning darajasi" },
    ],
  },
  {
    name: 'Grekcha harflar',
    symbols: [
      { label: 'α', latex: '\\alpha', title: 'Alfa' },
      { label: 'β', latex: '\\beta', title: 'Beta' },
      { label: 'γ', latex: '\\gamma', title: 'Gamma' },
      { label: 'δ', latex: '\\delta', title: 'Delta' },
      { label: 'θ', latex: '\\theta', title: 'Teta' },
      { label: 'λ', latex: '\\lambda', title: 'Lambda' },
      { label: 'μ', latex: '\\mu', title: 'Myu' },
      { label: 'σ', latex: '\\sigma', title: 'Sigma' },
      { label: 'φ', latex: '\\phi', title: 'Fi' },
      { label: 'ω', latex: '\\omega', title: 'Omega' },
      { label: 'Δ', latex: '\\Delta', title: 'Katta Delta' },
      { label: 'Σ', latex: '\\Sigma', title: 'Katta Sigma' },
    ],
  },
  {
    name: 'Geometriya',
    symbols: [
      { label: '∠', latex: '\\angle', title: 'Burchak' },
      { label: '⊥', latex: '\\perp', title: 'Perpendikulyar' },
      { label: '∥', latex: '\\parallel', title: 'Parallel' },
      { label: '△', latex: '\\triangle', title: 'Uchburchak' },
      { label: '□', latex: '\\square', title: "To'rtburchak" },
      { label: '○', latex: '\\circ', title: 'Aylana' },
      { label: '∞', latex: '\\infty', title: 'Cheksizlik' },
    ],
  },
  {
    name: "Integral va summa",
    symbols: [
      { label: '∫', latex: '\\int', title: 'Integral' },
      { label: '∫ₐᵇ', latex: '\\int_{a}^{b}', title: "Aniq integral" },
      { label: '∑', latex: '\\sum', title: 'Summa' },
      { label: '∑ᵢ', latex: '\\sum_{i=1}^{n}', title: "Indeksli summa" },
      { label: '∏', latex: '\\prod', title: "Ko'paytma" },
      { label: 'lim', latex: '\\lim_{x \\to a}', title: 'Limit' },
      { label: "f'", latex: "f'(x)", title: 'Hosila' },
      { label: 'd/dx', latex: '\\frac{d}{dx}', title: 'Differensial' },
    ],
  },
  {
    name: "To'plamlar",
    symbols: [
      { label: '∈', latex: '\\in', title: 'Element' },
      { label: '∉', latex: '\\notin', title: 'Element emas' },
      { label: '⊂', latex: '\\subset', title: "Qism to'plam" },
      { label: '⊃', latex: '\\supset', title: "O'z ichiga oladi" },
      { label: '∪', latex: '\\cup', title: 'Birlashma' },
      { label: '∩', latex: '\\cap', title: 'Kesishma' },
      { label: '∅', latex: '\\emptyset', title: "Bo'sh to'plam" },
      { label: 'ℕ', latex: '\\mathbb{N}', title: 'Natural sonlar' },
      { label: 'ℤ', latex: '\\mathbb{Z}', title: 'Butun sonlar' },
      { label: 'ℚ', latex: '\\mathbb{Q}', title: 'Ratsional sonlar' },
      { label: 'ℝ', latex: '\\mathbb{R}', title: 'Haqiqiy sonlar' },
    ],
  },
  {
    name: 'Qavslar',
    symbols: [
      { label: '( )', latex: '\\left( \\right)', title: 'Oddiy qavslar' },
      { label: '[ ]', latex: '\\left[ \\right]', title: "To'rtburchak qavslar" },
      { label: '{ }', latex: '\\left\\{ \\right\\}', title: 'Figurali qavslar' },
      { label: '⟨ ⟩', latex: '\\langle \\rangle', title: 'Burchak qavslar' },
    ],
  },
]

export const MathToolbar = ({ onInsert, isDark = true }: MathToolbarProps) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const handleInsert = (latex: string) => {
    onInsert(`$${latex}$`)
  }

  return (
    <div className="space-y-2">
      {/* Category buttons */}
      <div className="flex flex-wrap gap-1">
        {mathCategories.map((category) => (
          <button
            key={category.name}
            type="button"
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
            onClick={() => setActiveCategory(activeCategory === category.name ? null : category.name)}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              activeCategory === category.name
                ? isDark
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-500 text-white'
                : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
            <FiChevronDown
              className={`w-3 h-3 transition-transform ${activeCategory === category.name ? 'rotate-180' : ''}`}
            />
          </button>
        ))}
      </div>

      {/* Symbol grid */}
      <AnimatePresence>
        {activeCategory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className={`p-2 rounded-lg border ${
                isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex flex-wrap gap-1">
                {mathCategories
                  .find((c) => c.name === activeCategory)
                  ?.symbols.map((symbol, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                      onClick={() => handleInsert(symbol.latex)}
                      title={symbol.title}
                      className={`w-10 h-10 rounded-lg font-medium text-lg flex items-center justify-center transition-all ${
                        isDark
                          ? 'bg-gray-800 text-white hover:bg-blue-500 hover:text-white border border-gray-700'
                          : 'bg-white text-gray-800 hover:bg-blue-500 hover:text-white border border-gray-200'
                      }`}
                    >
                      {symbol.label}
                    </button>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MathToolbar
