'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _contextTypes = require('./context-types');

var _contextTypes2 = _interopRequireDefault(_contextTypes);

var _containerContextTypes = require('./container-context-types');

var _containerContextTypes2 = _interopRequireDefault(_containerContextTypes);

var _vendors = require('./vendors');

var _vendors2 = _interopRequireDefault(_vendors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LeadingMedia = function (_Component) {
  _inherits(LeadingMedia, _Component);

  function LeadingMedia(props, context) {
    _classCallCheck(this, LeadingMedia);

    var _this = _possibleConstructorReturn(this, (LeadingMedia.__proto__ || Object.getPrototypeOf(LeadingMedia)).call(this, props, context));

    _this.leadingMedia = null;

    _this.context.onLeadingMediaChange(function (vendor, media, player, playerComp, playerState) {
      if (vendor !== _this.props.vendor) return;
      var shouldUpdate = false;
      if (media && _this.leadingMedia !== media) {
        _this.leadingMedia = media;
        shouldUpdate = true;
      }
      if (player) {
        if (_this.currentPlayer !== player) {
          _this.currentPlayer = player;
          shouldUpdate = true;
        }
        _this.wasPaused = player.paused; // When dismounting player wrapper - html5 audio object is stopped
      }
      if (playerComp && _this.playerComp !== playerComp) {
        _this.playerComp = playerComp;
        _this.playerEvents = playerComp._playerEvents;
        shouldUpdate = true;
      }
      if (playerState && _this.playerState !== playerState) {
        _this.playerState = playerState;
        shouldUpdate = true;
      }
      if (shouldUpdate) {
        _this.forceUpdate();
      }
    });

    _this._getPublicMediaProps = _this._getPublicMediaProps.bind(_this);
    _this._setPlayerState = _this._setPlayerState.bind(_this);
    return _this;
  }

  _createClass(LeadingMedia, [{
    key: 'getChildContext',
    value: function getChildContext() {
      var _this2 = this;

      if (!this.leadingMedia) return null;
      if (this.playerComp) {
        if (this.leadingMedia._player !== this.playerComp) {
          this.leadingMedia._setPlayer(this.playerComp);
        }
        if (this.currentPlayer && this.playerComp._player !== this.currentPlayer) {
          this.playerComp._player = this.currentPlayer;
        }
        if (this.playerComp.props && this.playerComp.props !== this.leadingMedia._player.props) {
          this.leadingMedia._setPlayerProps(this.playerComp.props);
        }
        if (this.playerState && this.prevState !== this.playerState) {
          setTimeout(function () {
            _this2.prevState = _this2.playerState;
            _this2._setPlayerState(_this2.playerState);
          }, 0);
        }
      }
      return {
        media: this._getPublicMediaProps(),
        _mediaSetters: {
          setPlayer: this.leadingMedia._setPlayer,
          setPlayerProps: this.leadingMedia._setPlayerProps,
          setPlayerState: this._setPlayerState
        },
        _mediaGetters: {
          getPlayerEvents: function getPlayerEvents() {
            return _this2.playerEvents || _this2.leadingMedia._getPlayerEvents();
          }
        }
      };
    }
  }, {
    key: '_setPlayerState',
    value: function _setPlayerState(state) {
      if (!this.leadingMedia.unmounted) {
        this.leadingMedia._setPlayerState(state);
      } else {
        this.context._setUnmountedState(this.leadingMedia, state);
      }
      this.setState(state);
    }
  }, {
    key: '_getPublicMediaProps',
    value: function _getPublicMediaProps() {
      return _extends({}, this.leadingMedia._getPublicMediaProps(), this.state);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var _props = this.props,
          children = _props.children,
          className = _props.className;

      if (!this.leadingMedia) return null;
      return _react2.default.createElement(
        'div',
        { className: className },
        _react2.default.createElement('div', {
          ref: function ref(node) {
            if (_this3.leadingMedia && node && _this3.currentPlayer) {
              if (node.children.length) {
                if (node.children[0] !== _this3.currentPlayer) {
                  node.replaceChild(_this3.currentPlayer, node.children[0]);
                }
              } else {
                node.appendChild(_this3.currentPlayer);
              }
              if (!_this3.wasPaused) {
                _this3.currentPlayer.play();
              }
              if (_this3.leadingMedia._player) {
                _this3.leadingMedia._player._player = _this3.currentPlayer;
              }
              if (_this3.playerEvents) {
                Object.keys(_this3.playerEvents).forEach(function (key) {
                  _this3.currentPlayer[key.toLowerCase()] = _this3.playerEvents[key];
                });
              }
            }
          }
        }),
        typeof children === 'function' && children(this.leadingMedia._getPublicMediaProps()),
        typeof children !== 'function' && children
      );
    }
  }]);

  return LeadingMedia;
}(_react.Component);

LeadingMedia.propTypes = {
  vendor: _react.PropTypes.oneOf(_vendors2.default)
};
LeadingMedia.defaultProps = {
  vendor: 'audio'
};
LeadingMedia.contextTypes = _containerContextTypes2.default;
LeadingMedia.childContextTypes = _contextTypes2.default;
exports.default = LeadingMedia;
module.exports = exports['default'];