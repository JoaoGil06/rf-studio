import { render } from '@testing-library/react';
import { useInfiniteScroll } from './useInfiniteScroll';

/**
 * jsdom ships no IntersectionObserver, so the test brings one: a stub that records
 * every instance, the element it observes and its options, and lets a test drive
 * the callback by hand. Everything asserted below is about *when* the hook
 * observes — which is the whole of its behaviour.
 */
class ObserverStub {
  static instances: ObserverStub[] = [];

  readonly rootMargin: string;

  observed: Element[] = [];
  disconnected = false;

  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.rootMargin = options?.rootMargin ?? '0px';
    ObserverStub.instances.push(this);
  }

  observe(target: Element) {
    this.observed.push(target);
  }

  unobserve() {}

  disconnect() {
    this.disconnected = true;
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  /** Stands in for the browser scrolling the sentinel into view. */
  trigger(isIntersecting = true) {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

function Sentinel({ onLoadMore, enabled }: { onLoadMore: () => void; enabled: boolean }) {
  const sentinelRef = useInfiniteScroll({ onLoadMore, enabled });

  return <button type="button" ref={sentinelRef} />;
}

const live = () => ObserverStub.instances.filter((instance) => !instance.disconnected);

/** The one observer currently attached — a test asserting on none has said so. */
function liveObserver(): ObserverStub {
  const [observer] = live();
  if (!observer) throw new Error('expected an attached IntersectionObserver');

  return observer;
}

beforeEach(() => {
  ObserverStub.instances = [];
  vi.stubGlobal('IntersectionObserver', ObserverStub);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useInfiniteScroll', () => {
  it('observes the sentinel as soon as it mounts', () => {
    render(<Sentinel onLoadMore={vi.fn()} enabled />);

    expect(live()).toHaveLength(1);
    expect(liveObserver().observed).toHaveLength(1);
  });

  it('loads ahead of the fold rather than at the very bottom', () => {
    render(<Sentinel onLoadMore={vi.fn()} enabled />);

    expect(liveObserver().rootMargin).toBe('400px');
  });

  it('asks for the next page when the sentinel comes into view', () => {
    const onLoadMore = vi.fn();
    render(<Sentinel onLoadMore={onLoadMore} enabled />);

    liveObserver().trigger();

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('stays quiet when the sentinel leaves the viewport', () => {
    const onLoadMore = vi.fn();
    render(<Sentinel onLoadMore={onLoadMore} enabled />);

    liveObserver().trigger(false);

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('observes nothing while disabled', () => {
    render(<Sentinel onLoadMore={vi.fn()} enabled={false} />);

    expect(live()).toHaveLength(0);
  });

  // The reason the observer is rebuilt rather than left attached: an
  // IntersectionObserver reports *changes*, so a sentinel already on screen when
  // the previous page finishes produces no second callback. Without a fresh
  // observer the scroll stops paginating and looks like the catalogue ended.
  it('observes afresh when it is re-enabled, so an on-screen sentinel fires again', () => {
    const onLoadMore = vi.fn();
    const { rerender } = render(<Sentinel onLoadMore={onLoadMore} enabled />);

    const first = liveObserver();
    first.trigger();

    rerender(<Sentinel onLoadMore={onLoadMore} enabled={false} />);
    expect(first.disconnected).toBe(true);

    rerender(<Sentinel onLoadMore={onLoadMore} enabled />);

    const second = liveObserver();
    expect(second).not.toBe(first);
    expect(second.observed).toHaveLength(1);

    second.trigger();
    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  it('disconnects when the sentinel unmounts', () => {
    const { unmount } = render(<Sentinel onLoadMore={vi.fn()} enabled />);
    const observer = liveObserver();

    unmount();

    expect(observer.disconnected).toBe(true);
  });

  it('renders without an IntersectionObserver at all', () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    expect(() => render(<Sentinel onLoadMore={vi.fn()} enabled />)).not.toThrow();
  });
});
