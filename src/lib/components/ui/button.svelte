<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	import { tv, type VariantProps } from 'tailwind-variants';

	const styles = tv({
		base: 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
		defaultVariants: { size: 'md', variant: 'primary' },
		variants: {
			size: {
				lg: 'text-base px-5 py-2.5',
				md: 'text-sm px-3.5 py-2',
				sm: 'text-xs px-2.5 py-1.5',
			},
			variant: {
				danger:
					'bg-red-600 text-white shadow-sm shadow-red-950/30 hover:bg-red-500 dark:hover:bg-red-500',
				ghost: 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800/60',
				outline:
					'border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800',
				primary:
					'bg-violet-600 text-white shadow-sm shadow-violet-950/30 hover:bg-violet-500 dark:hover:bg-violet-500',
				subtle:
					'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',
			},
		},
	});

	type Variants = VariantProps<typeof styles>;

	type Props = Omit<HTMLAnchorAttributes, 'children' | 'class'> &
		Omit<HTMLButtonAttributes, 'children' | 'class'> &
		Variants & {
			children: Snippet;
			class?: string;
			href?: string;
		};

	let {
		children,
		class: className,
		href,
		size,
		type = 'button',
		variant,
		...rest
	}: Props = $props();

	const buttonClass = $derived(styles({ class: className, size, variant }));
</script>

{#if href}
	<a {href} class={buttonClass} {...rest}>
		{@render children()}
	</a>
{:else}
	<button {type} class={buttonClass} {...rest}>
		{@render children()}
	</button>
{/if}
