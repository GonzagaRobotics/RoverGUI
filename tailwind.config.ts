import { join } from 'path';
import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import { skeleton } from '@skeletonlabs/tw-plugin';

export default {
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
	],
	theme: {
		extend: {
			keyframes: {
				'heartbeat-pulse': {
					'0%': { transform: 'scale(1)' },
					'7%': { transform: 'scale(1.13)' },
					'10%, 12%': { transform: 'scale(1.15)' },
					'20%': { transform: 'scale(0.93)' },
					'23%': { transform: 'scale(0.91)' },
					'30%': { transform: 'scale(1.03)' },
					'37%': { transform: 'scale(1)' },
					'42%': { transform: 'scale(0.98)' },
					'50%': { transform: 'scale(1)' }
				}
			},
			animation: {
				'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				heartbeat: 'heartbeat-pulse 1.5s ease-in-out infinite'
			}
		}
	},
	plugins: [
		forms,
		typography,
		skeleton({
			themes: {
				preset: [
					{
						name: 'wintry',
						enhancements: true
					}
				]
			}
		})
	]
} satisfies Config;
