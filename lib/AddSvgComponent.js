import React from 'react'
import Svg, { Defs, G, Path } from 'react-native-svg'

const AddSvgComponent = props => (
  <Svg width="24" height="24" viewBox="0 0 24 24" {...props}>
    <Defs />
    <G id="prefix___" data-name="+" transform="translate(-134.282 -480.118)">
      <Path
        id="prefix__\u77E9\u5F62_131"
        data-name="\u77E9\u5F62 131"
        className="prefix__cls-1"
        transform="translate(134.282 490.127)"
        d="M0 0h24.022v4.004H0z"
        fill={props.color}
      />
      <Path
        id="prefix__\u77E9\u5F62_133"
        data-name="\u77E9\u5F62 133"
        className="prefix__cls-1"
        transform="rotate(-90 324.216 179.924)"
        d="M0 0h24.022v4.004H0z"
        fill={props.color}
      />
    </G>
  </Svg>
)

export default AddSvgComponent

