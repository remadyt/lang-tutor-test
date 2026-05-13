<script lang="ts">
	import Button from './button.svelte';

	interface Props {
		cancelLabel: string;
		confirmLabel: string;
		description: string;
		destructive?: boolean;
		onClose: () => void;
		onConfirm: () => Promise<void> | void;
		open: boolean;
		title: string;
	}

	let {
		cancelLabel,
		confirmLabel,
		description,
		destructive = false,
		onClose,
		onConfirm,
		open,
		title,
	}: Props = $props();

	let dialog = $state<HTMLDialogElement | undefined>();
	let isWorking = $state(false);

	$effect(() => {
		if (dialog === undefined) {
			return;
		}

		if (open && !dialog.open) {
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	});

	async function handleConfirm(): Promise<void> {
		isWorking = true;

		try {
			await onConfirm();
			onClose();
		} finally {
			isWorking = false;
		}
	}
</script>

<dialog
	bind:this={dialog}
	onclose={onClose}
	class="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-zinc-200 bg-white p-0 shadow-xl backdrop:bg-zinc-900/40 backdrop:backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900"
>
	<div class="space-y-4 p-6">
		<h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
		<p class="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{description}</p>
		<div class="flex justify-end gap-2 pt-2">
			<Button variant="ghost" disabled={isWorking} onclick={onClose}>{cancelLabel}</Button>
			<Button
				variant={destructive ? 'danger' : 'primary'}
				disabled={isWorking}
				onclick={handleConfirm}
			>
				{confirmLabel}
			</Button>
		</div>
	</div>
</dialog>
