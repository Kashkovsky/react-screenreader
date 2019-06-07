import * as React from "react";

type ReaderState = {
	[msg: string]: {
		focused: boolean;
		handlers: {
			onFocus: () => void;
			onBlur: () => void;
		};
	};
};
export const actionTypes = {
	FOCUS: "FOCUS",
	BLUR: "BLUR",
	SET: "SET"
};

const initialState: ReaderState = {};

export const elementReducer = (state: ReaderState, action: any): ReaderState => {
	switch (action.type) {
		case actionTypes.FOCUS:
			return {
				...Object.keys(state).reduce(
					(a, c) => {
						a[c] = {
							...a[c],
							focused: false
						};
						return a;
					},
					{} as ReaderState
				),

				[action.message]: {
					...state[action.message],
					focused: true
				}
			};
		case actionTypes.BLUR:
			return {
				...state,
				[action.message]: {
					...state[action.message],
					focused: false
				}
			};
		case actionTypes.SET:
			return {
				...state,
				[action.message]: {
					handlers: action.handlers,
					focused: false
				}
			};
		default:
			return state;
	}
};

export const AriaLiveMessage = (props: any) => (
	<span
		style={{
			zIndex: 999999,
			border: 0,
			clip: "rect(1px, 1px, 1px, 1px)",
			height: 0,
			width: 0,
			position: "absolute",
			overflow: "hidden",
			padding: 0,
			whiteSpace: "nowrap"
		}}
		className="a11y-text"
		{...props}
	/>
);

const useScreenReader = () => {
	const [ state, dispatch ] = React.useReducer(elementReducer, initialState);

	const a11y = React.useCallback(
		() => {
			const message = Object.keys(state).find(x => state[x].focused);
			return message ? (
				<AriaLiveMessage aria-live="polite">
					<p>{message}</p>
				</AriaLiveMessage>
			) : null;
		},
		[ state ]
	);

	const createEventHandlers = React.useCallback(
		(message: string) => ({
			onFocus: () => dispatch({ type: actionTypes.FOCUS, message }),
			onBlur: () => dispatch({ type: actionTypes.BLUR, message })
		}),
		[]
	);

	const reader = React.useCallback(
		(message: string) => {
			if (!state[message]) {
				const handlers = createEventHandlers(message);
				dispatch({ type: actionTypes.SET, message, handlers });
				return handlers;
			}

			return state[message].handlers;
		},
		[ state ]
	);

	const read = (message: string) => dispatch({ type: actionTypes.FOCUS, message });

	return { a11y, reader, read };
};

export default useScreenReader;
