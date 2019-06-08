import * as React from "react";
import useScreenReader, { elementReducer, actionTypes, AriaLiveMessage } from "./useScreenReader";
import { renderHook, act } from "react-hooks-testing-library";
import { shallow, ShallowWrapper } from "enzyme";
import * as Q from "q";

describe("useScreenReader", () => {
	const handlers = {
		onFocus: jest.fn(),
		onBlur: jest.fn()
	};
	test("elementReducer - SET adds handlers to state", () => {
		expect(elementReducer({}, { type: actionTypes.SET, message: "test", handlers })).toEqual({
			test: {
				focused: false,
				handlers
			}
		});
	});

	test("elementReducer - FOCUS sets existing item as focused", () => {
		const initialState = {
			test: {
				focused: false
			}
		};
		expect(elementReducer(initialState as any, { type: actionTypes.FOCUS, message: "test" })).toEqual({
			test: {
				focused: true
			}
		});
	});

	test("elementReducer - FOCUS creates new item if it doesn't exist and sets it as focused", () => {
		expect(elementReducer({}, { type: actionTypes.FOCUS, message: "test" })).toEqual({
			test: {
				focused: true
			}
		});
	});

	test("elementReducer - FOCUS sets focus to false for all items except given one", () => {
		const initialState = {
			test: {
				focused: true
			}
		};
		expect(elementReducer(initialState as any, { type: actionTypes.FOCUS, message: "test1" })).toEqual({
			test1: {
				focused: true
			},
			test: {
				focused: false
			}
		});
	});

	test("elementReducer - BLUR sets existing item as not focused", () => {
		const initialState = {
			test: {
				focused: true
			}
		};
		expect(elementReducer(initialState as any, { type: actionTypes.BLUR, message: "test" })).toEqual({
			test: {
				focused: false
			}
		});
	});

	test("elementReducer - returns existing state bu default", () => {
		expect(elementReducer({}, { type: "TEST" })).toEqual({});
	});

	test("read - adds aria-live element with given text", () => {
		const { result } = renderHook(() => useScreenReader());
		act(() => result.current.read("some text"));
		const wrapper = shallow(<div>{result.current.a11y()}</div>);
		expect(wrapper.find("p").first().text()).toBe("some text");
	});

	test("reader - adds aria-live element with given text when applied element is focused", () => {
		const { result } = renderHook(() => useScreenReader());
		const Elem: React.FunctionComponent<React.HTMLAttributes<HTMLDivElement>> = props => <div {...props} />;
		let wrapper: ShallowWrapper;

		act(() => {
			const reader = result.current.reader("some text");
			wrapper = shallow(
				<div>
					{result.current.a11y()}
					<Elem {...reader} />
				</div>
			);

			const onFocus = wrapper.find(Elem).prop("onFocus");
			onFocus && onFocus({} as any);
			Q.delay(1)
				.then(() => {
					wrapper.update();
					expect(wrapper.find("p").first().text()).toBe("some text");
				})
				.done();

			const onBlur = wrapper.find(Elem).prop("onBlur");
			onBlur && onBlur({} as any);
			Q.delay(1)
				.then(() => {
					wrapper.update();
					expect(wrapper.find(AriaLiveMessage)).toHaveLength(0);
				})
				.done();
		});
	});
});
