import React, { Component, PropTypes, Children } from 'react'
import contextTypes from './context-types'
import containerContextTypes from './container-context-types'
import vendorTypes from './vendors'

class LeadingMedia extends Component {
  static propTypes = {
    vendor: PropTypes.oneOf(vendorTypes),
  }

  static defaultProps = {
    vendor: 'audio',
  }

  static contextTypes = containerContextTypes
  static childContextTypes = contextTypes

  constructor(props, context) {
    super(props, context)

    this.leadingMedia = null

    this.context.onLeadingMediaChange((vendor, media, player, playerComp, playerState) => {
      if (vendor !== this.props.vendor) return
      let shouldUpdate = false
      if (media && this.leadingMedia !== media) {
        this.leadingMedia = media
        shouldUpdate = true
      }
      if (player) {
        if (this.currentPlayer !== player) {
          this.currentPlayer = player
          shouldUpdate = true
        }
        this.wasPaused = player.paused // When dismounting player wrapper - html5 audio object is stopped
      }
      if (playerComp && this.playerComp !== playerComp) {
        this.playerComp = playerComp
        this.playerEvents = playerComp._playerEvents
        shouldUpdate = true
      }
      if (playerState && this.playerState !== playerState) {
        this.playerState = playerState
        shouldUpdate = true
      }
      if (shouldUpdate) {
        this.forceUpdate()
      }
    })

    this._getPublicMediaProps = this._getPublicMediaProps.bind(this)
    this._setPlayerState = this._setPlayerState.bind(this)
  }

  getChildContext() {
    if (!this.leadingMedia) return null
    if (this.playerComp) {
      if (this.leadingMedia._player !== this.playerComp) {
        this.leadingMedia._setPlayer(this.playerComp)
      }
      if (this.currentPlayer && this.playerComp._player !== this.currentPlayer) {
        this.playerComp._player = this.currentPlayer
      }
      if (this.playerComp.props && this.playerComp.props !== this.leadingMedia._player.props) {
        this.leadingMedia._setPlayerProps(this.playerComp.props)
      }
      if (this.playerState && this.prevState !== this.playerState) {
        setTimeout(() => {
          this.prevState = this.playerState
          this._setPlayerState(this.playerState)
        }, 0)
      }
    }
    return {
      media: this._getPublicMediaProps(),
      _mediaSetters: {
        setPlayer: this.leadingMedia._setPlayer,
        setPlayerProps: this.leadingMedia._setPlayerProps,
        setPlayerState: this._setPlayerState,
      },
      _mediaGetters: {
        getPlayerEvents: () => {
          return this.playerEvents || this.leadingMedia._getPlayerEvents()
        }
      },
    }
  }

  _setPlayerState(state) {
    if (!this.leadingMedia.unmounted) {
      this.leadingMedia._setPlayerState(state)
    } else {
      this.context._setUnmountedState(this.leadingMedia, state)
    }
    this.setState(state)
  }

  _getPublicMediaProps() {
    return {
      ...this.leadingMedia._getPublicMediaProps(),
      ...this.state,
    }
  }

  render() {
    const {
      children,
      className,
    } = this.props
    if (!this.leadingMedia) return null
    return (
      <div className={className}>
        <div {...{
          ref: (node) => {
            if (this.leadingMedia && node && this.currentPlayer) {
              if (node.children.length) {
                if (node.children[0] !== this.currentPlayer) {
                  node.replaceChild(this.currentPlayer, node.children[0])
                }
              } else {
                node.appendChild(this.currentPlayer)
              }
              if (!this.wasPaused) {
                this.currentPlayer.play()
              }
              if (this.leadingMedia._player) {
                this.leadingMedia._player._player = this.currentPlayer
              }
              if (this.playerEvents) {
                Object.keys(this.playerEvents).forEach(key => {
                  this.currentPlayer[key.toLowerCase()] = this.playerEvents[key]
                })
              }
            }
          },
        }} />
        {typeof children === 'function' &&
          children(this.leadingMedia._getPublicMediaProps())
        }
        {typeof children !== 'function' &&
          children
        }
      </div>
    )
  }
}

export default LeadingMedia
