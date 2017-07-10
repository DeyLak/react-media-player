'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _containerContextTypes = require('./container-context-types');

var _containerContextTypes2 = _interopRequireDefault(_containerContextTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MediaContainer = function (_Component) {
  _inherits(MediaContainer, _Component);

  function MediaContainer(props) {
    _classCallCheck(this, MediaContainer);

    var _this = _possibleConstructorReturn(this, (MediaContainer.__proto__ || Object.getPrototypeOf(MediaContainer)).call(this, props));

    _this.registeredMedia = [];
    _this.leadingMediaChangeCallbacks = [];
    _this.leadingMedia = {};
    _this.currentPlayers = {};
    _this.state = {};

    _this._addMediaInstance = _this._addMediaInstance.bind(_this);
    _this._eventCallback = _this._eventCallback.bind(_this);
    _this._handleLeadingMediaChange = _this._handleLeadingMediaChange.bind(_this);
    _this._addUnmountedPlayer = _this._addUnmountedPlayer.bind(_this);
    _this._getUnmountedState = _this._getUnmountedState.bind(_this);
    _this._setUnmountedState = _this._setUnmountedState.bind(_this);
    _this.onLeadingMediaChange = _this.onLeadingMediaChange.bind(_this);
    return _this;
  }

  _createClass(MediaContainer, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        _addMediaInstance: this._addMediaInstance,
        _addUnmountedPlayer: this._addUnmountedPlayer,
        _getUnmountedState: this._getUnmountedState,
        _setUnmountedState: this._setUnmountedState,
        _eventCallback: this._eventCallback,
        onLeadingMediaChange: this.onLeadingMediaChange
      };
    }
  }, {
    key: '_addMediaInstance',
    value: function _addMediaInstance(media) {
      this.registeredMedia.push(media);
    }
  }, {
    key: '_addUnmountedPlayer',
    value: function _addUnmountedPlayer(player, media, playerComp) {
      var currentVendor = media._player.props.vendor;
      if (this.leadingMedia[currentVendor] === media) {
        this.currentPlayers[currentVendor] = player;
        this._handleLeadingMediaChange(media, player, playerComp);
      }
    }
  }, {
    key: '_getUnmountedState',
    value: function _getUnmountedState(media) {
      var currentVendor = media._player.props.vendor;
      if (this.leadingMedia[currentVendor] === media) return this.state;
      return {};
    }
  }, {
    key: '_setUnmountedState',
    value: function _setUnmountedState(media, state) {
      var currentVendor = media._player.props.vendor;
      if (this.leadingMedia[currentVendor] === media) {
        this.setState(state);
      }
    }
  }, {
    key: '_eventCallback',
    value: function _eventCallback(type, media, state) {
      var _this2 = this;

      var currentVendor = media._player.props.vendor;
      var onlyForLeading = function onlyForLeading() {
        if (_this2.leadingMedia[currentVendor] === media) {
          _this2._handleLeadingMediaChange.apply(_this2, arguments);
        }
      };
      var callbacks = {
        onPlay: this._handleLeadingMediaChange,
        onPause: onlyForLeading,
        onDuration: onlyForLeading,
        onProgress: onlyForLeading,
        onTimeUpdate: onlyForLeading,
        onMute: onlyForLeading,
        onVolumeChange: onlyForLeading,
        onError: onlyForLeading
      };
      if (callbacks[type]) {
        callbacks[type](media, media._player._player, media._player, state);
      }
    }
  }, {
    key: '_handleLeadingMediaChange',
    value: function _handleLeadingMediaChange(media, player, playerComp, playerState) {
      var _this3 = this;

      var currentVendor = media._player.props.vendor;
      if (this.leadingMedia[currentVendor] && this.leadingMedia[currentVendor]._player && this.leadingMedia[currentVendor] !== media) {
        this.leadingMedia[currentVendor].stop();
        this.setState(playerState);
      }
      if (this.currentPlayers[currentVendor] && this.currentPlayers[currentVendor] !== player) {
        this.currentPlayers[currentVendor].pause();
      }

      this.leadingMedia[currentVendor] = media;
      this.currentPlayers[currentVendor] = player;

      this.leadingMediaChangeCallbacks.forEach(function (callback) {
        callback(currentVendor, media, _this3.currentPlayers[currentVendor], playerComp, playerState);
      });
    }
  }, {
    key: 'onLeadingMediaChange',
    value: function onLeadingMediaChange(callback) {
      this.leadingMediaChangeCallbacks.push(callback);
    }
  }, {
    key: 'render',
    value: function render() {
      return _react.Children.only(this.props.children);
    }
  }]);

  return MediaContainer;
}(_react.Component);

MediaContainer.propTypes = {
  children: _react.PropTypes.node.isRequired
};
MediaContainer.childContextTypes = _containerContextTypes2.default;
exports.default = MediaContainer;
module.exports = exports['default'];