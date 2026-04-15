import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Skeleton from '../Skeleton';

describe('Skeleton', () => {
  it('renders a rect skeleton by default', () => {
    const { container } = render(<Skeleton width={200} height={20} />);
    const el = container.querySelector('.skeleton');
    expect(el).toBeInTheDocument();
    expect(el).not.toHaveClass('skeleton--circle');
  });

  it('applies width and height via inline style', () => {
    const { container } = render(<Skeleton width={150} height={30} />);
    const el = container.querySelector('.skeleton');
    expect(el.style.width).toBe('150px');
    expect(el.style.height).toBe('30px');
  });

  it('renders a circle skeleton', () => {
    const { container } = render(<Skeleton variant="circle" width={48} height={48} />);
    const el = container.querySelector('.skeleton');
    expect(el).toHaveClass('skeleton--circle');
  });

  it('renders a text skeleton with the correct number of lines', () => {
    const { container } = render(<Skeleton variant="text" lines={4} />);
    const lines = container.querySelectorAll('.skeleton');
    expect(lines).toHaveLength(4);
  });

  it('makes the last line of a multi-line text skeleton narrower', () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    const lines = container.querySelectorAll('.skeleton');
    expect(lines[2].style.width).toBe('70%');
    expect(lines[0].style.width).toBe('100%');
  });

  it('renders a single text line at full width', () => {
    const { container } = render(<Skeleton variant="text" lines={1} />);
    const lines = container.querySelectorAll('.skeleton');
    expect(lines).toHaveLength(1);
    expect(lines[0].style.width).toBe('100%');
  });

  it('forwards extra style props', () => {
    const { container } = render(<Skeleton width={100} height={10} style={{ marginBottom: '8px' }} />);
    const el = container.querySelector('.skeleton');
    expect(el.style.marginBottom).toBe('8px');
  });

  it('forwards extra className prop', () => {
    const { container } = render(<Skeleton width={100} height={10} className="my-custom" />);
    const el = container.querySelector('.skeleton');
    expect(el).toHaveClass('my-custom');
  });
});
