import React, { Component } from 'react'

import './Tile.css'

class Tile extends Component {
  render () {
    var { tile, index, handleKeyDown, user, boss } = this.props
    var styles = {
        width: (tile.width) + '%',
        height: '50px'
    }
    if (tile.tileType.name === 'user') {
      styles.background = 'rgba(0,0,139,'+ user.health/75 +')'
    }
    if (tile.tileType.name === 'boss') {
      styles.background = 'rgba(0,100,0,'+ boss.health/100 +')'
    }
    if (tile.tileType.name === 'enemy') {
      styles.background = 'rgba(0,100,0,'+ tile.tileType.health/50 +')'
    }
    return (
      <div
        id={tile.tileType.name}
        className='tile'
        style={styles}
        tabIndex={index}
        onKeyDown={handleKeyDown}>
      </div>
    )
  }
}

export default Tile
