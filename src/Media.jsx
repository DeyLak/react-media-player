import React, { Component, PropTypes, Children } from 'react'
import ReactDOM, { findDOMNode } from 'react-dom'
import contextTypes from './context-types'
import containerContextTypes from './container-context-types'
import requestFullscreen from './utils/request-fullscreen'
import exitFullscreen from './utils/exit-fullscreen'
import fullscreenChange from './utils/fullscreen-change'

const MEDIA_EVENTS = {
  onPlay: 'isPlaying',
  onPause: 'isPlaying',
  onDuration: 'duration',
  onProgress: 'progress',
  onTimeUpdate: 'currentTime',
  onMute: 'isMuted',
  onVolumeChange: 'volume',
  onError: null,
}
const MEDIA_EVENTS_KEYS = Object.keys(MEDIA_EVENTS)

class Media extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired
  }

  static contextTypes = containerContextTypes
  static childContextTypes = contextTypes

  state = {
    currentTime: 0,
    progress: 0,
    duration: 0.1,
    volume: 1,
    isLoading: true,
    isPlaying: false,
    isMuted: false,
    isFullscreen: false
  }

  _playerProps = {}
  _lastVolume = 0

  getChildContext() {
    return {
      media: this._getPublicMediaProps(),
      _mediaSetters: {
        setPlayer: this._setPlayer,
        setPlayerProps: this._setPlayerProps,
        setPlayerState: this._setPlayerState
      },
      _mediaGetters: {
        getPlayerEvents: this._getPlayerEvents()
      },
      _isLeading: false,
    }
  }

  componentDidMount() {
    fullscreenChange('add', this._handleFullscreenChange)
    if (this.context._addMediaInstance) {
      this.context._addMediaInstance(this)
    }
  }

  componentWillUnmount() {
    this.unmounted = true
    fullscreenChange('remove', this._handleFullscreenChange)
    if (this.context._addUnmountedPlayer) {
      this.context._addUnmountedPlayer(this._player.instance, this, this._player)
      this.context._setUnmountedState(this, this.state)
    }
  }

  _getState() {
    return this.unmounted ? this.context._getUnmountedState(this) : this.state
  }

  _setState(state) {
    if (this.unmounted) {
      this.context._setUnmountedState(this, state)
    } else {
      this.setState(state)
    }
  }

  _getPublicMediaProps() {
    return {
      ...this._getState(),
      play: this.play,
      pause: this.pause,
      playPause: this.playPause,
      stop: this.stop,
      seekTo: this.seekTo,
      skipTime: this.skipTime,
      mute: this.mute,
      muteUnmute: this.muteUnmute,
      setVolume: this.setVolume,
      addVolume: this.addVolume,
      fullscreen: this.fullscreen
    }
  }

  _getPlayerEvents() {
    const events = {}

    MEDIA_EVENTS_KEYS.forEach(key => {
      const stateKey = MEDIA_EVENTS[key]
      const propCallback = this._playerProps[key]
      const leadingPropCallback = this._playerProps[`_${key}Leading`]

      events[key] = (val) => {
        if (stateKey) {
          if (!this.unmounted) {
            this._setState({ [stateKey]: val })
          }
          const newState = {
            ...this._getState(),
            [stateKey]: val,
          }
          if (this.context._eventCallback) {
            this.context._eventCallback(key, this, newState)
          }
          if (typeof propCallback === 'function') {
            propCallback(newState)
          }
          if (typeof leadingPropCallback === 'function') {
            leadingPropCallback(newState)
          }
        }
      }
    })
    return events
  }

  _setPlayer = (component) => {
    this._player = component
  }

  _setPlayerProps = (props) => {
    this._playerProps = {
      ...this._playerProps,
      ...props,
    }
  }

  _setPlayerState = (state) => {
    this._setState(state)
  }

  play = () => {
    this._player.play()
  }

  pause = () => {
    this._player.pause()
  }

  playPause = () => {
    if (!this._getState().isPlaying) {
      this._player.play()
    } else {
      this._player.pause()
    }
  }

  stop = () => {
    this._player.stop()
  }

  seekTo = (currentTime) => {
    this._player.seekTo(currentTime)
    this._setState({ currentTime })
  }

  skipTime = (amount) => {
    const { currentTime, duration } = this._getState()
    let newTime = (currentTime + amount)

    if (newTime < 0) {
      newTime = 0
    } else if (newTime > duration) {
      newTime = duration
    }

    this.seekTo(newTime)
  }

  mute = (isMuted) => {
    if (isMuted) {
      this._lastVolume = this._getState().volume
      this._player.setVolume(0)
    } else {
      const volume = (this._lastVolume > 0) ? this._lastVolume : 0.1
      this._player.setVolume(volume)
    }
    this._player.mute(isMuted)
  }

  muteUnmute = () => {
    this.mute(!this._getState().isMuted)
  }

  setVolume = (volume) => {
    const isMuted = (volume <= 0)

    if (isMuted !== this._getState().isMuted) {
      this.mute(isMuted)
    } else {
      this._lastVolume = volume
    }

    this._player.setVolume(volume)
  }

  addVolume = (amount) => {
    let newVolume = (this._getState().volume + (amount * 0.01))

    if (newVolume < 0) {
      newVolume = 0
    } else if (newVolume > 1) {
      newVolume = 1
    }

    this.setVolume(newVolume)
  }

  fullscreen = () => {
    if (!this._getState().isFullscreen) {
      this._player.node[requestFullscreen]()
    } else {
      document[exitFullscreen]()
    }
  }

  _handleFullscreenChange = ({ target }) => {
    if (target === this._player.node) {
      this._setState({ isFullscreen: !this._getState().isFullscreen })
    }
  }

  render() {
    const { children } = this.props

    if (typeof children === 'function') {
      return children(this._getPublicMediaProps())
    }

    return Children.only(children)
  }
}

export default Media
