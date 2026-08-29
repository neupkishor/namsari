import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

type ChevronDirection = 'up' | 'down' | 'left' | 'right'

type ChevronProps = {
  size?: number
  color?: string
  strokeWidth?: number
  direction?: ChevronDirection
}

export function Chevron({
  size = 20,
  color = '#111111',
  strokeWidth = 2,
  direction = 'right',
}: ChevronProps) {
  const rotation = {
    right: '0deg',
    down: '90deg',
    left: '180deg',
    up: '270deg',
  }[direction]

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ transform: [{ rotate: rotation }] }}
    >
      <Path
        d="M9 6l6 6-6 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}