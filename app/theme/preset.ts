import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'

// Qonics design tokens layered on PrimeVue's Aura preset.
export const QonicsPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#eef8eb', 100: '#d3efce', 200: '#a8dea7', 300: '#7acb85', 400: '#42b86b',
      500: '#19a657', 600: '#118254', 700: '#0f6b46', 800: '#0c5438', 900: '#08432f', 950: '#042d23'
    },
    formField: { borderRadius: '8px' },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff', 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
          500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#10243a', 950: '#0b1a2b'
        },
        primary: {
          color: '{primary.600}', contrastColor: '#ffffff', hoverColor: '{primary.700}', activeColor: '{primary.800}'
        },
        highlight: { background: '{primary.50}', focusBackground: '{primary.100}', color: '{primary.700}', focusColor: '{primary.800}' }
      }
    }
  },
  components: {
    datatable: {
      colorScheme: { light: { headerCell: { background: '{surface.50}', color: '{surface.600}' } } }
    },
    card: { root: { borderRadius: '12px' } }
  }
})
