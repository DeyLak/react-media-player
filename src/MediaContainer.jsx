import React, { Component, PropTypes, Children } from 'react'
import ReactDOM, { findDOMNode } from 'react-dom'
import contextTypes from './container-context-types'


class MediaContainer extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired
  }

  static childContextTypes = contextTypes

  constructor(props) {
    super(props)

    this.registeredMedia = []
    this.leadingMediaChangeCallbacks = []
    this.leadingMedia = {}
    this.currentPlayers = {}
    this.state = {}

    this._addMediaInstance = this._addMediaInstance.bind(this)
    this._eventCallback = this._eventCallback.bind(this)
    this._handleLeadingMediaChange = this._handleLeadingMediaChange.bind(this)
    this._addUnmountedPlayer = this._addUnmountedPlayer.bind(this)
    this._getUnmountedState = this._getUnmountedState.bind(this)
    this._setUnmountedState = this._setUnmountedState.bind(this)
    this.onLeadingMediaChange = this.onLeadingMediaChange.bind(this)
  }

  getChildContext() {
    return {
      _addMediaInstance: this._addMediaInstance,
      _addUnmountedPlayer: this._addUnmountedPlayer,
      _getUnmountedState: this._getUnmountedState,
      _setUnmountedState: this._setUnmountedState,
      _eventCallback: this._eventCallback,
      onLeadingMediaChange: this.onLeadingMediaChange,
    }
  }

  _addMediaInstance(media) {
    this.registeredMedia.push(media)
  }

  _addUnmountedPlayer(player, media, playerComp) {
    const currentVendor = media._player.props.vendor
    if (this.leadingMedia[currentVendor] === media) {
      this.currentPlayers[currentVendor] = player
      this._handleLeadingMediaChange(media, player, playerComp)
    }
  }

  _getUnmountedState(media) {
    const currentVendor = media._player.props.vendor
    if (this.leadingMedia[currentVendor] === media) return this.state
    return {}
  }

  _setUnmountedState(media, state) {
    const currentVendor = media._player.props.vendor
    if (this.leadingMedia[currentVendor] === media) {
      this.setState(state)
    }
  }

  _eventCallback(type, media, state) {
    const currentVendor = media._player.props.vendor
    const onlyForLeading = (...args) => {
      if (this.leadingMedia[currentVendor] === media) {
        this._handleLeadingMediaChange(...args)
      }
    }
    const callbacks = {
      onPlay: this._handleLeadingMediaChange,
      onPause: onlyForLeading,
      onDuration: onlyForLeading,
      onProgress: onlyForLeading,
      onTimeUpdate: onlyForLeading,
      onMute: onlyForLeading,
      onVolumeChange: onlyForLeading,
      onError: onlyForLeading,
    }
    if (callbacks[type]) {
      callbacks[type](media, media._player._player, media._player, state)
    }
  }

  _handleLeadingMediaChange(media, player, playerComp, playerState) {
    const currentVendor = media._player.props.vendor
    if (
      this.leadingMedia[currentVendor] &&
      this.leadingMedia[currentVendor]._player &&
      this.leadingMedia[currentVendor] !== media
    ) {
      this.leadingMedia[currentVendor].stop()
      this.setState(playerState)
    }
    if (this.currentPlayers[currentVendor] && this.currentPlayers[currentVendor] !== player) {
      this.currentPlayers[currentVendor].pause()
    }

    this.leadingMedia[currentVendor] = media
    this.currentPlayers[currentVendor] = player

    this.leadingMediaChangeCallbacks.forEach(callback => {
      callback(currentVendor, media, this.currentPlayers[currentVendor], playerComp, playerState)
    })
  }

  onLeadingMediaChange(callback) {
    this.leadingMediaChangeCallbacks.push(callback)
  }

  render() {
    return Children.only(this.props.children)
  }
}

export default MediaContainer
