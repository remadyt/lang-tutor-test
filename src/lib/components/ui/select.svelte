<script lang="ts" generics="TValue extends string">
	import type { HTMLSelectAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils/cn';
	import { ChevronDown } from 'lucide-svelte';

	interface Option {
		description?: string;
		label: string;
		value: TValue;
	}

	type Props = Omit<HTMLSelectAttributes, 'children' | 'class' | 'value'> & {
		class?: string;
		label: string;
		options: readonly Option[];
		value: TValue;
	};

	let { class: className, label, options, value = $bindable(), ...rest }: Props = $props();
</script>

<label class={cn('flex flex-col gap-1.5 text-sm', className)}>
	<span class="text-xs font-medium tracking-wider text-zinc-500 uppercase">{label}</span>
	<span class="relative">
		<select
			bind:value
			{...rest}
			class="block w-full appearance-none rounded-xl border border-zinc-200 bg-white py-2.5 pr-9 pl-3 text-base text-zinc-900 shadow-sm transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/40 focus:outline-none sm:text-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
		>
			{#each options as option (option.value)}
				<option value={option.value}>
					{option.label}{option.description ? ` — ${option.description}` : ''}
				</option>
			{/each}
		</select>
		<ChevronDown
			class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400"
			size="16"
			aria-hidden="true"
		/>
	</span>
</label>
