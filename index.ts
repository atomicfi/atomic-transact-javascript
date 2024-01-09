export namespace Atomic {
	export enum Product {
		DEPOSIT = 'deposit',
		VERIFY = 'verify',
		IDENTIFY = 'identify',
		WITHHOLD = 'withhold'
	};

	export type DeepLink = {
		companyId?: string;
		companyName?: string;
		step: 'login-company' | 'search-company' | 'search-payroll';
	};

	export type Experiment = {
		fractionalDeposits?: boolean;
	};

	export type SearchTag = 'gig-economy' | 'payroll-provider' | 'unemployment';

	export type Search = {
		excludedTags?: SearchTag[];
		tags?: SearchTag[];
	};

	export type Distribution = {
		amount?: number;
		canUpdate?: boolean;
		type: string;
	};

	export enum Operation {
		DEPOSIT = 'deposit',
		EARN = 'earn',
		TAX = 'tax',
		VERIFY = 'verify'
	}

	export type TaskConfiguration = {
		distribution?: Distribution;
		onComplete?: string;
		onFail?: string;
		operation?: Operation;
		product: Product;
	};

	export type Theme = {
		brandColor?: string;
		dark?: boolean;
		display?: string;
		overlayColor?: string;
	};

	export type TransactConfiguration = {
		conversionToken?: string;
		deeplink?: DeepLink;
		experiments?: Experiment;
		handoff?: ('authentication-success' | 'exit-prompt' | 'high-latency')[];
		inSdk?: boolean;
		language?: 'en' | 'es';
		linkedAccount?: string;
		metadata?: Record<string, boolean | number | string>;
		publicToken: string;
		search?: Search;
		tasks: TaskConfiguration[];
		theme?: Theme;
	};

	export type TransactOptions = {
		config?: TransactConfiguration;
		container?: string;
		environmentOverride?: string;
		onInteraction?: EventHandler<InteractionData>;
		onDataRequest?: EventHandler<DataRequestData>;
		onFinish?: EventHandler<FinishData>;
		onClose?: EventHandler<CloseData>;
	};

	export type TransactResult = {
		close: () => void;
	};

	export type InteractionData = {
		identifier: string;
		name: string;
		value: Record<string, unknown>;
	};

	export type FinishData = {
		identifier: string;
		taskId: string;
		taskWorkflowId: string;
	};

	export type CloseData = {
		identifier: string;
		reason: string;
	};

	export type DataRequestData = {
		// I don't really have much information on this object.
	};

	export type EventHandler<T> = (data: T) => void;

	let atomicIframeEventListener: (event: MessageEvent) => void;

	enum AtomicEvent {
		CLOSE = 'atomic-transact-close',
		FINISH = 'atomic-transact-finish',
		INTERACTION = 'atomic-transact-interaction',
		DATA_REQUEST = 'atomic-transact-data-request',
		OPEN_URL = 'atomic-transact-open-url'
	}

	const IFRAME_ID = 'atomic-transact-iframe' as const;
	const TRANSACT_DEFAULT_URL = 'https://transact.atomicfi.com' as const;
	const BASE_STYLES = [
		{ width: '100%' },
		{ height: '100%' },
		{ 'z-index': '888888888' },
		{ 'border-width': '0' },
		{ 'overflow-x': 'hidden' },
		{ 'overflow-y': 'auto' }
	] as const;
	const MODAL_STYLES = [
		{ position: 'fixed' },
		{ top: '0' },
		{ left: '0' },
		{ right: '0' },
		{ bottom: '0' }
	] as const;

	/**
	 * Remove the Transact experience
	 *
	 * @internal
	 */
	const removeTransact = (): void => {
		const iframeElement = document.querySelector(`#${IFRAME_ID}`);

		if (atomicIframeEventListener) window.removeEventListener('message', atomicIframeEventListener);
		if (iframeElement?.parentNode !== document.body) return;
		document.body.style.removeProperty('overflow');
		document.body.removeChild(iframeElement);
	};

	/**
	 * Generates iframe event listener function.
	 *
	 * @param options
	 * @param options.onInteraction
	 * @param options.onFinish
	 * @param options.onClose
	 * @param options.onDataRequest
	 *
	 * @returns The iframe event listener function.
	 *
	 * @internal
	 */
	const iframeEventListenerFactory = ({
		onInteraction,
		onFinish,
		onClose,
		onDataRequest
	}: {
		onInteraction?: EventHandler<InteractionData>;
		onFinish?: EventHandler<FinishData>;
		onClose?: EventHandler<CloseData>;
		onDataRequest?: EventHandler<DataRequestData>;
	}): (event: MessageEvent) => void => ({
		data: {
			payload,
			event: eventName
		}
	}: MessageEvent) => {
			switch (eventName) {
				case AtomicEvent.CLOSE:
					if (onClose) onClose(payload);
					removeTransact();
					break;
				case AtomicEvent.FINISH:
					if (onFinish) onFinish(payload);
					removeTransact();
					break;
				case AtomicEvent.INTERACTION:
					if (onInteraction) onInteraction(payload);
					break;
				case AtomicEvent.DATA_REQUEST:
					if (onDataRequest) onDataRequest(payload);
					break;
				case AtomicEvent.OPEN_URL:
					window.open(payload.url, '_blank');
					break;
				default:
					console.log('Unhandled postMessage Event', eventName);
			}
		};

	/**
	 * Launch the Transact experience
	 *
	 * @param options - Options for launching Transact
	 *
	 * @returns The result of the launch
	 */
	export const transact = ({
		config,
		container,
		environmentOverride,
		onInteraction,
		onDataRequest,
		onFinish,
		onClose
	}: TransactOptions = {
			config: {
				publicToken: '',
				tasks: []
			},
			onInteraction: () => { },
			onDataRequest: () => { },
			onFinish: () => { },
			onClose: () => { },
		}): TransactResult => {
		if (!container) document.body.style.overflow = 'hidden';

		const iframeElement = document.createElement('iframe');

		const environmentString = JSON.stringify({
			inSdk: true,
			platform: {
				name: 'browser',
				sdkVersion: '3.0.0',
				systemVersion: `${navigator.platform}-${navigator.vendor ?? 'unknown'
					}`
			},
			...config
		});
		const environmentUrl = environmentOverride || TRANSACT_DEFAULT_URL;

		iframeElement.src = `${environmentUrl}/initialize/${btoa(environmentString)}`;

		const styles: Record<string, string>[] = [...BASE_STYLES];
		if (!container) styles.push(...MODAL_STYLES)

		iframeElement.id = IFRAME_ID;
		iframeElement.style.cssText = styles
			.map((style) => Object.entries(style)
				.map(([key, value]) => `${key}: ${value}; `)
				.join('')
			)
			.join('')
			.trim();

		if (container) {
			const containerElement = document.querySelector(container);

			if (containerElement) {
				containerElement.appendChild(iframeElement);
			} else {
				throw new Error(`No container found for "${container}"`);
			}
		} else {
			document.body.appendChild(iframeElement);
		}

		atomicIframeEventListener = iframeEventListenerFactory({
			onInteraction,
			onDataRequest,
			onFinish,
			onClose
		});
		window.addEventListener('message', atomicIframeEventListener);

		return {
			close: () => removeTransact()
		};
	}
}

export const Product = {
	DEPOSIT: Atomic.Product.DEPOSIT,
	VERIFY: Atomic.Product.VERIFY,
	IDENTIFY: Atomic.Product.IDENTIFY,
	WITHHOLD: Atomic.Product.WITHHOLD
} as const;