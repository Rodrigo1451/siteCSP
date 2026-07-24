(function () {
  'use strict';

  var SMOOTH_TAU = 0.25;
  var MIN_COPIES = 2;
  var COPY_HEADROOM = 2;

  function LogoLoop(container) {
    this.container = container;
    this.track = container.querySelector('.logoloop__track');
    this.originalList = container.querySelector('.logoloop__list');

    var speed = parseFloat(container.dataset.speed != null ? container.dataset.speed : 80);
    var direction = container.dataset.direction || 'left';
    var hoverSpeedAttr = container.dataset.hoverSpeed;
    this.hoverSpeed = hoverSpeedAttr !== undefined ? parseFloat(hoverSpeedAttr) : 0;

    var magnitude = Math.abs(speed);
    var dirMult = direction === 'left' ? 1 : -1;
    var speedMult = speed < 0 ? -1 : 1;
    this.targetVelocity = magnitude * dirMult * speedMult;

    this.seqWidth = 0;
    this.copyCount = MIN_COPIES;
    this.isHovered = false;
    this.offset = 0;
    this.velocity = 0;
    this.lastTimestamp = null;
    this.rafId = null;

    this._bindEvents();
    this._updateDimensions();
    this._startAnimation();

    var self = this;
    if (window.ResizeObserver) {
      this.ro = new ResizeObserver(function () { self._updateDimensions(); });
      this.ro.observe(this.container);
      this.ro.observe(this.originalList);
    } else {
      window.addEventListener('resize', function () { self._updateDimensions(); });
    }

    // Re-measure after images load
    var imgs = this.originalList.querySelectorAll('img');
    var remaining = imgs.length;
    if (remaining === 0) return;
    var onLoad = function () {
      remaining -= 1;
      if (remaining === 0) self._updateDimensions();
    };
    imgs.forEach(function (img) {
      if (img.complete) { onLoad(); }
      else {
        img.addEventListener('load', onLoad, { once: true });
        img.addEventListener('error', onLoad, { once: true });
      }
    });
  }

  LogoLoop.prototype._updateDimensions = function () {
    var containerWidth = this.container.clientWidth;
    var rect = this.originalList.getBoundingClientRect();
    var seqWidth = rect.width;

    if (seqWidth > 0) {
      this.seqWidth = Math.ceil(seqWidth);
      var copiesNeeded = Math.ceil(containerWidth / seqWidth) + COPY_HEADROOM;
      var newCount = Math.max(MIN_COPIES, copiesNeeded);
      if (newCount !== this.copyCount) {
        this.copyCount = newCount;
        this._rebuildCopies();
      }
    }
  };

  LogoLoop.prototype._rebuildCopies = function () {
    var lists = this.track.querySelectorAll('.logoloop__list');
    for (var i = 1; i < lists.length; i++) {
      lists[i].parentNode.removeChild(lists[i]);
    }
    for (var c = 1; c < this.copyCount; c++) {
      var copy = this.originalList.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      this.track.appendChild(copy);
    }
  };

  LogoLoop.prototype._startAnimation = function () {
    var self = this;

    function animate(timestamp) {
      if (self.lastTimestamp === null) self.lastTimestamp = timestamp;

      var dt = Math.max(0, timestamp - self.lastTimestamp) / 1000;
      self.lastTimestamp = timestamp;

      var target = self.isHovered ? self.hoverSpeed : self.targetVelocity;
      var ease = 1 - Math.exp(-dt / SMOOTH_TAU);
      self.velocity += (target - self.velocity) * ease;

      if (self.seqWidth > 0) {
        var next = self.offset + self.velocity * dt;
        next = ((next % self.seqWidth) + self.seqWidth) % self.seqWidth;
        self.offset = next;
        self.track.style.transform = 'translate3d(' + (-self.offset) + 'px, 0, 0)';
      }

      self.rafId = requestAnimationFrame(animate);
    }

    this.rafId = requestAnimationFrame(animate);
  };

  LogoLoop.prototype._bindEvents = function () {
    var self = this;
    this.track.addEventListener('mouseenter', function () { self.isHovered = true; });
    this.track.addEventListener('mouseleave', function () { self.isHovered = false; });
  };

  LogoLoop.prototype.destroy = function () {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    if (this.ro) this.ro.disconnect();
  };

  function initAll() {
    document.querySelectorAll('.logoloop').forEach(function (el) {
      if (!el._logoloopInstance) {
        el._logoloopInstance = new LogoLoop(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
