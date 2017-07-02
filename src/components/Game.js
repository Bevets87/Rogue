import React, { Component } from 'react';
import {user, boss, enemies, item, wall, space, playerWeapon, bossWeapon } from '../game/variables'

import Tile from './Tile'

import './Game.css'

class Game extends Component {
  constructor (props) {
    super (props)
    this.state = {
      tiles: null,
      height: null,
      view: [],
      blocks: 0,
      bossGoingRight: false,
      enemies: 0,
      weapon: 'Knuckles',
      replayModal: false,
      userPosition: {row: 145, column: 12},
      bossPosition: {row: 0, column: 0},
      blockGunModal: false
    }
    this.playGame = this.playGame.bind(this)
    this.initGame = this.initGame.bind(this)
    this.makeGrid = this.makeGrid.bind(this)
    this.initGameVariables = this.initGameVariables.bind(this)
    this.setEnemyPositions = this.setEnemyPositions.bind(this)
    this.setItemPositions = this.setItemPositions.bind(this)
    this.setView = this.setView.bind(this)
    this.moveRight = this.moveRight.bind(this)
    this.moveLeft = this.moveLeft.bind(this)
    this.moveUp = this.moveUp.bind(this)
    this.moveDown = this.moveDown.bind(this)
    this.fireWeapon = this.fireWeapon.bind(this)
    this.fireBossWeapon = this.fireBossWeapon.bind(this)
    this.moveBoss = this.moveBoss.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.closeBlockGunModal = this.closeBlockGunModal.bind(this)
    this.resetGame = this.resetGame.bind(this)
  }
  componentDidMount () {
    var { enemies } = this.state
    this.playGame()
    if (enemies === 0) {
      this.setState({
        blockGunModal: true
      })
    }
  }
  componentWillMount () {
    this.initGame()
  }
  closeBlockGunModal (e) {
    e.target.parentElement.style.display = 'none'
  }
  makeGrid (width, height) {
    var tiles = [];
    for (var r = 0; r < height; r++) {
      tiles[r] = [];
      for (var c = 0; c < width; c++) {
        var type, num
        if (r < 10) {
          type = space
        }
        else if (r === 10 && c !== 12) {
          type = wall
        }
        else if (r === 10 && c === 12) {
          type = space
        }
        else {
          num = Math.floor(Math.random() * 50)
          type = num === 1 ? wall : space
        }
        tiles[r][c] = {column: c, row: r, width: (1/width) * 100, tileType: type}
      }
    }
    tiles[145][12].tileType = user
    tiles[0][0].tileType = boss
    tiles[0][0].index = 0
    return tiles
  }
  initGameVariables () {
    user.health = 100
    user.level = 1
    user.attack = 10
    boss.health = 200
    boss.attack = 10
    item.total = 3
    while (enemies.length > 0 ) {
      enemies.pop()
    }
    var count = 0
    while (count < 7) {
    enemies.push({
        name: 'enemy',
        health: 50,
        attack: 10
      })
      count++
    }
  }
  initGame () {
    var height = 150
    var width = 25
    this.initGameVariables()
    var tiles = this.makeGrid(width, height)
    this.setEnemyPositions(tiles,height,width)
    this.setItemPositions(tiles,height,width)
    this.setState({
      blocks: 0,
      bossGoingRight: false,
      weapon: 'Knuckles',
      replayModal: false,
      tiles: tiles,
      height: height,
      width: width,
      userPosition: {row: 145, column: 12},
      bossPosition: {row: 0, column: 0},
      blockGunModal: false,
      enemies: 7
    })
  }
  resetGame () {
    this.initGame()
    this.playGame()
  }
  playGame () {
    this.setView()
    var replayModal = this.state.replayModal
    var gameLoop = setInterval(function(){
      this.moveBoss()
      if (this.state.enemies === 0) {
        this.setState({
          blockGunModal: true
        })
      }
      if (user.health <= 0 || boss.health <= 0) {
        replayModal = true
        this.setState({
          replayModal: replayModal
        })
        clearInterval(gameLoop)
      }
    }.bind(this),200)
  }
  setEnemyPositions (t, h, w) {
    while (enemies.length > 0) {
      var row = Math.floor(Math.random() * h)
      var col = Math.floor(Math.random() * w)
      if (row > 25 && row < h - 20 && t[row][col].tileType.name === 'space') {
        t[row][col].tileType = enemies[enemies.length - 1]
        enemies.pop()
        this.setState({
          tiles: t
        })
      } else {
        this.setEnemyPositions(t,h,w)
      }
    }
  }
  setItemPositions (t, h, w) {
    while (item.total > 0) {
      var row = Math.floor(Math.random() * h)
      var col = Math.floor(Math.random() * w)
      if (row > 10 && row < h - 15 && t[row][col].tileType.name === 'space') {
        t[row][col].tileType = item
        item.total -= 1
        this.setState({
          tiles: t
        })
      } else {
        this.setItemPositions(t,h,w)
      }
    }
  }
  setView () {
    var { userPosition, height, view, tiles } = this.state
    var offsetBottom, offsetTop
    if (userPosition.row > height - 5) {
      offsetBottom = height - 1
      offsetTop = height - 10
    }
    else if (userPosition.row < 5) {
      offsetBottom = 9
      offsetTop = 0
    } else {
      offsetTop = userPosition.row - 5;
      offsetBottom = userPosition.row + 4;
    }
    view = [];
    tiles.forEach(function (tile,i) {
      if (i >= offsetTop && i <= offsetBottom) {
        view.push(tile)
      }
    })
    this.setState({
      view: view
    })
  }
  moveLeft (row, col, replaced, replacer) {
    var { tiles, width } = this.state
    if (col === 0) {
      tiles[row][col].tileType = replaced;
      col = width - 1;
      tiles[row][col].tileType = replacer;
      this.setState({
        tiles: tiles
      })
    } else{
      tiles[row][col].tileType = replaced;
      tiles[row][col - 1].tileType = replacer;
      this.setState({
        tiles: tiles
      })
    }
    this.setView()
  }
  moveRight (row, col, replaced, replacer) {
    var { tiles, width } = this.state
    if (col === width - 1) {
      tiles[row][col].tileType = replaced;
      col = 0;
      tiles[row][col].tileType = replacer;
      this.setState({
        tiles: tiles
      })
    } else {
      tiles[row][col].tileType = replaced;
      tiles[row][col + 1].tileType = replacer;
      this.setState({
        tiles: tiles
      })
    }
    this.setView()
  }
  moveUp (row, col, replaced, replacer) {
    var { tiles } = this.state
    tiles[row][col].tileType = replaced;
    tiles[row - 1][col].tileType = replacer;
    this.setState({
      tiles: tiles
    })
    this.setView()
  }
  moveDown (row,col,replaced,replacer) {
    var { tiles } = this.state
    tiles[row][col].tileType = replaced;
    tiles[row + 1][col].tileType = replacer
    this.setState({
      tiles: tiles
    })
    this.setView()
  }
  fireWeapon (row, col) {
    var { tiles } = this.state
    var count = 1;
    var fire = setInterval(function () {
      if (count > 1) {
        tiles[row - (count - 1)][col].tileType = space
        this.setState({
          tiles: tiles
        })
      }
      if (row - count >= 0 && tiles[row - (count)][col].tileType.name === 'space') {
        tiles[row - (count)][col].tileType = playerWeapon
        this.setState({
          tiles: tiles
        })
        count++
      }
      else if (row - count >= 0 && tiles[row - (count)][col].tileType.name === 'boss') {
        if (boss.health > 0) {
          boss.health -= user.attack
        }
        clearInterval(fire)
      } else {
        clearInterval(fire)
      }
    }.bind(this),70)
  }
  fireBossWeapon(row,col) {
    var { tiles } = this.state
    var count = 1;
    var fire = setInterval(function(){
      if ( count > 1) {
        tiles[row + (count - 1)][col].tileType = space
        this.setState({
          tiles: tiles
        })
      }
      if (row + count < 10 && tiles[row + (count)][col].tileType.name === 'space') {
        tiles[row + (count)][col].tileType = bossWeapon
        this.setState({
          tiles: tiles
        })
        count++
      }
      else if (row + count < 10 && tiles[row + (count)][col].tileType.name === 'user') {
        if (user.health > 0) {
          user.health -= boss.attack
        }
        clearInterval(fire)
      } else {
        clearInterval(fire)
      }
    }.bind(this),70)
  }
  moveBoss () {
    var { bossPosition, bossGoingRight, width } = this.state
    var num = Math.floor(Math.random() * 2)
    if (num === 1) {
      this.fireBossWeapon(bossPosition.row,bossPosition.column)
    }
    if (bossGoingRight === false && bossPosition.column === 0) {
      this.moveRight(bossPosition.row,bossPosition.column,space,boss)
      bossPosition.column += 1
      bossGoingRight = true
      this.setState({
        bossPosition: bossPosition,
        bossGoingRight: bossGoingRight
      })
    }
    else if (bossGoingRight === true && bossPosition.column < (width - 1)) {
      this.moveRight(bossPosition.row,bossPosition.column,space,boss)
      bossPosition.column += 1
      this.setState({
        bossPosition: bossPosition
      })
    }
    else if (bossGoingRight === true && bossPosition.column === (width - 1)) {
      this.moveLeft(bossPosition.row,bossPosition.column,space,boss)
      bossPosition.column -= 1
      bossGoingRight = false
      this.setState({
        bossPosition: bossPosition,
        bossGoingRight: bossGoingRight
      })
    }
    else if (bossGoingRight === false && bossPosition.column > 0) {
      this.moveLeft(bossPosition.row,bossPosition.column,space,boss)
      bossPosition.column -= 1
      this.setState({
        bossPosition: bossPosition
      })
    }
  }
  handleKeyDown (e) {
    var { tiles, userPosition, width, blocks, enemies, weapon, bossPosition, height } = this.state
    var row = this.state.userPosition.row
    var col = this.state.userPosition.column
    if (e.keyCode === 37) {
      if (col > 0 && tiles[row][col - 1].tileType.name === 'space') {
        this.moveLeft(row,col,space,user)
        this.setState({
          userPosition: {row: row, column: col - 1}
        })
      }
      else if (col === 0 && tiles[row][width - 1].tileType.name === 'space') {
        this.moveLeft(row,col,space,user)
        this.setState({
          userPosition: {row: row, column: width - 1}
        })
      }
      if (col > 0 && tiles[row][col - 1].tileType.name === 'item') {
        this.moveLeft(row,col,space,user)
        user.health += 50
        blocks++
        this.setState({
          blocks: blocks,
          userPosition: {row: row, column: col - 1}
        })
      }
      else if (col === 0 && tiles[row][width - 1].tileType.name === 'item') {
        this.moveLeft(row,col,space,user)
        user.health += 50
        blocks++
        this.setState({
          blocks: blocks,
          userPosition: {row: row, column: width - 1}
        })
      }
      if (col > 0 && tiles[row][col - 1].tileType.name === 'enemy') {
        user.health -= 10
        tiles[row][col - 1].tileType.health -= 20
        this.setState({
          tiles: tiles
        })
        if (tiles[row][col - 1].tileType.health < 0) {
          enemies--
          // eslint-disable-next-line
          switch (enemies) {
            case 4:
            user.level++
            user.health += 30
            break;
            case 2:
            user.level++
            user.health += 50
            break;
            case 0:
            user.level++
            user.attack += 20
            weapon = 'Block Gun'
            this.setState({
              weapon: weapon
            })
            break;
          }
          this.moveLeft(row,col,space,user)
          this.setState({
            userPosition: {row: row, column: col - 1},
            enemies: enemies
          })
        }
      }
      else if (col === 0 && tiles[row][width - 1].tileType.name === 'enemy') {
        user.health -= 10
        tiles[row][width - 1].tileType.health -= 20
        this.setState({
          tiles: tiles
        })
        if (tiles[row][width - 1].tileType.health < 0) {
          enemies--
          // eslint-disable-next-line
          switch(enemies) {
            case 4:
            user.level++
            user.health += 30
            break;
            case 2:
            user.level++
            user.health += 50
            break;
            case 0:
            user.level++
            user.attack += 20
            weapon = 'Block Gun'
            this.setState({
              weapon: weapon
            })
            break;
          }
          this.moveLeft(row,col,space,user)
          this.setState({
            userPosition: {row: row, column: width - 1},
            enemies: enemies
          })
        }
      }
    }
    else if (e.keyCode === 39) {
     if (col < width - 1 && tiles[row][col + 1].tileType.name === 'space') {
       this.moveRight(row,col,space,user)
       this.setState({
         userPosition: {row: row, column: col + 1}
       })
     }
     else if (col === width - 1 && tiles[row][0].tileType.name === 'space') {
       this.moveRight(row,col,space,user)
       this.setState({
         userPosition: {row: row, column: 0}
       })
     }
      if (col < width - 1 && tiles[row][col + 1].tileType.name === 'item') {
        this.moveRight(row,col,space,user)
        user.health += 50
        blocks++
        this.setState({
         blocks: blocks,
         userPosition: {row: row, column: col + 1}
       })
     }
     else if (col === width - 1 && tiles[row][0].tileType.name === 'item') {
       this.moveRight(row,col,space,user)
       blocks++
       user.health += 50
       this.setState({
         blocks: blocks,
         userPosition: {row: row, column: 0}
       })
     }
     if (col < width - 1 && tiles[row][col + 1].tileType.name === 'enemy') {
       user.health -= 10
       tiles[row][col + 1].tileType.health -= 20
       this.setState({
         tiles: tiles
       })
       if (tiles[row][col + 1].tileType.health < 0) {
         enemies--
         // eslint-disable-next-line
         switch (enemies) {
           case 4:
           user.level++
           user.health += 30
           break;
           case 2:
           user.level++
           user.health += 50
           break;
           case 0:
           user.level++
           user.attack += 20
           weapon = 'Block Gun'
           this.setState({
             weapon: weapon
           })
           break;
         }
         this.moveRight(row,col,space,user)
         this.setState({
           userPosition: {row: row, column: col + 1},
           enemies: enemies
         })
       }
     }
     else if (col === width - 1 && tiles[row][0].tileType.name === 'enemy') {
       user.health -= 10
       tiles[row][0].tileType.health -= 20
       this.setState({
         tiles: tiles
       })
       if (tiles[row][0].tileType.health < 0) {
         enemies--
         // eslint-disable-next-line
         switch (enemies) {
           case 4:
           user.level++
           user.health += 30
           break;
           case 2:
           user.level++
           user.health += 50
           break;
           case 0:
           user.level++
           user.attack += 20
           weapon = 'Block Gun'
           this.setState({
             weapon: weapon
           })
           break;
         }
         this.moveRight(row,col,space,user)
         this.setState({
           userPosition: {row: row, column: 0},
           enemies: enemies
         })
       }
     }
   }
   else if (e.keyCode === 38) {
     if (row > bossPosition.row + 3 && tiles[row - 1][col].tileType.name === 'space') {
       userPosition.row = row - 1;
       userPosition.column = col
       this.setState({
         userPosition: userPosition
       })
       this.moveUp(row,col,space,user)
     }
     if (row > bossPosition.row + 3 && tiles[row - 1][col].tileType.name === 'item') {
       this.moveUp(row,col,space,user)
       user.health += 50
       blocks++
       this.setState({
         blocks: blocks,
         userPosition: {row: row - 1, column: col}
       })
     }
     if (row > bossPosition.row + 3 && tiles[row - 1][col].tileType.name === 'enemy') {
       user.health -= 10
       tiles[row - 1][col].tileType.health -= 20
       this.setState({
         tiles: tiles
       })
       if (tiles[row - 1][col].tileType.health < 0) {
         enemies--
         // eslint-disable-next-line
         switch (enemies) {
           case 4:
           user.level++
           user.health += 30
           break;
           case 2:
           user.level++
           user.health += 50
           break;
           case 0:
           user.level++
           user.attack += 20
           weapon = 'Block Gun'
           this.setState({
             weapon: weapon
           })
           break;
         }
         this.moveUp(row,col,space,user)
         this.setState({
           userPosition: {row: row - 1, column: col},
           enemies: enemies
         })
       }
     }
   }
   else if (e.keyCode === 40) {
     if (row < height - 1 && tiles[row + 1][col].tileType.name === 'space') {
       this.moveDown(row,col,space,user)
       this.setState({
         userPosition: {row: row + 1, column: col}
       })
     }
     if (row < height - 1 && tiles[row + 1][col].tileType.name === 'item') {
       this.moveDown(row,col,space,user)
       user.health += 50
       blocks++
       this.setState({
         blocks: blocks,
         userPosition: {row: row + 1, column: col}
       })
     }
     if (row < height - 1 && tiles[row + 1][col].tileType.name === 'enemy') {
       user.health -= 10
       tiles[row + 1][col].tileType.health -= 20
       this.setState({
         tiles: tiles
       })
       if (tiles[row + 1][col].tileType.health < 0) {
         enemies--
         // eslint-disable-next-line
         switch (enemies) {
           case 4:
           user.level++
           user.health += 30
           break;
           case 2:
           user.level++
           user.health += 50
           break;
           case 0:
           user.level++
           user.attack += 20
           weapon = 'Block Gun'
           this.setState({
             weapon: weapon
           })
           break;
         }
         this.moveDown(row,col,space,user)
         this.setState({
           userPosition: {row: row + 1, column: col},
           enemies: enemies
          })
        }
      }
    }
    if (e.keyCode === 32 && user.level === 4) {
      this.fireWeapon(row,col)
    }
  }
  render () {
    var { replayModal, view, blockGunModal } = this.state
      return (
        <div className='container-fluid'>
          {replayModal && <div id='replay-modal'>
                            <h1 id='replay-modal-title'>Replay?</h1>
                            <button onClick={this.resetGame}>OK</button>
                          </div>
          }
          {blockGunModal && <div id='block-gun-modal'>
                              <p>You have acquired the block gun!!! Press spacebar to use it and defeat the final boss!!!</p>
                              <button onClick={this.closeBlockGunModal}>OK</button>
                            </div>
          }
          <h1>Roguelike Dungeon Crawler</h1>
          <ul>
            <li>Player Level:{user.level}</li>
            <li>Player Health:{user.health}</li>
            <li>Player Attack:{user.attack}</li>
            <li>Player Weapon:{this.state.weapon}</li>
          </ul>
          <ul>
            <li>Boss Health:{boss.health}</li>
          </ul>
          <ul>
            <li>Enemies:{this.state.enemies}</li>
          </ul>
          <div className='container'>
          {view.map(function(row, i) {
            return (
              <div key={i} className='row-of-tiles' tabIndex={row[i].row}>
                {row.map(function(col, j) {
                  return <Tile key={j} index={j} userPosition={this.state.userPosition} handleKeyDown={this.handleKeyDown} boss={boss} user={user} tile={col}/>
                }.bind(this))}
              </div>
            )
          }.bind(this))}
          </div>
        </div>
      )
  }
}

export default Game
