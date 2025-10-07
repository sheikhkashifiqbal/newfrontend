import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			'soft-blue': '#EDF2FB',
  			charcoal: '#212529',
  			charcoal80: '#212529CC',
  			'steel-blue': '#3F72AF',
  			'slate-gray': '#495057',
  			'medium-gray': '#898989',
  			'light-gray': '#F8F9FA',
				'cool-gray': '#DEE2E6',
				'muted-gray': '#6C757D',
				'soft-gray': '#E9ECEF',
				'blue-gray': '#E5EBF2',
				'dark-gray': '#495057',
				'misty-gray': '#ADB5BD',
				'royal-blue': '#376CFB',
				'bold-red': '#E01F22',
				'vibrant-red': '#EE4345',
				'dove-gray': '#CED4DA',
				'sunset-peach': '#F9B774',
				'ice-mist': '#DFE8F2',
				'soft-sky': '#BFD0E4',
				'coral-blush': '#FF6E70',
				'switch-green': '#6EDE8A',
				'danger-red': '#EF6351',
				'new-blue': '#7394EB',
				'sky-blue': '#00A6FB',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
			screens: {
				'450': '450px',
				'480': '480px',
				'500': '500px',
				'530': '530px',
				'550': '550px',
				'570': '570px',
				'600': '600px',
				'650': '650px',
				'700': '700px',
				'840': '840px',
				'900': '900px',
				'1000': '1000px',
				'1100': '1100px',
				'1200': '1200px',
				'1650': '1650px',
				'2060': '2060px'
			},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
			keyframes: {
				"caret-blink": {
					"0%,70%,100%": { opacity: "1" },
					"20%,50%": { opacity: "0" },
				},
			},
			animation: {
				"caret-blink": "caret-blink 1.25s ease-out infinite",
			},
  	}
  },
  plugins: [
			require("tailwindcss-animate"),
			require('tailwind-scrollbar')({ nocompatible: true}),
	],
} satisfies Config;
