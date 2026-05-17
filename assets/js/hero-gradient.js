// @ts-check
(function () {
  /**
   * @typedef {Object} HeroMotionOptions
   * @property {boolean} [immediate]
   *
   * @typedef {Object} HeroMotionController
   * @property {(x: number, y: number, options?: HeroMotionOptions) => void} setCursorPosition
   * @property {(x: number, y: number, options?: HeroMotionOptions) => void} setMotion
   * @property {(x: number, y: number, options?: HeroMotionOptions) => void} setVector
   * @property {() => void} reset
   *
   * @typedef {HTMLElement & { heroGradientMotion?: HeroMotionController }} HeroGradientHero
   */

  const HERO_SELECTOR = ".hero";
  const DEFAULT_POINT_X = 50;
  const DEFAULT_POINT_Y = 42;
  const MAX_BIAS_X = 20;
  const MAX_BIAS_Y = 16;
  const MAX_POINT_SHIFT_X = 12;
  const MAX_POINT_SHIFT_Y = 10;
  const EASING = 0.14;

  const reduceMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );
  const deviceOrientationEventApi = window.DeviceOrientationEvent;
  const supportsOrientationMotion = typeof deviceOrientationEventApi === "function";
  const hasOrientationPermissionGate =
    supportsOrientationMotion &&
    typeof deviceOrientationEventApi.requestPermission === "function";

  /**
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  /**
   * @param {HeroGradientHero} hero
   * @param {string} name
   * @param {number} value
   * @returns {void}
   */
  function setVar(hero, name, value) {
    hero.style.setProperty(name, `${value.toFixed(2)}%`);
  }

  /** @type {Set<HeroMotionController>} */
  const controllers = new Set();
  const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
  let sensorsListening = false;
  /** @type {number | undefined} */
  let orientationBaselineBeta;
  /** @type {number | undefined} */
  let orientationBaselineGamma;

  /**
   * @param {number} deltaX
   * @param {number} deltaY
   * @returns {void}
   */
  function applySensorMotion(deltaX, deltaY) {
    controllers.forEach((controller) => {
      controller.setMotion(deltaX, deltaY);
    });
  }

  /**
   * @param {DeviceOrientationEvent} event
   * @returns {void}
   */
  function handleOrientation(event) {
    if (event.beta == null || event.gamma == null) {
      return;
    }

    if (orientationBaselineBeta == null || orientationBaselineGamma == null) {
      orientationBaselineBeta = event.beta;
      orientationBaselineGamma = event.gamma;
      return;
    }

    const deltaBeta = event.beta - orientationBaselineBeta;
    const deltaGamma = event.gamma - orientationBaselineGamma;
    const normalizedX = clamp(deltaGamma / 28, -1, 1);
    const normalizedY = clamp(deltaBeta / 28, -1, 1);

    applySensorMotion(normalizedX, normalizedY);
  }

  /** @returns {void} */
  function resetOrientationBaseline() {
    orientationBaselineBeta = undefined;
    orientationBaselineGamma = undefined;
  }

  /** @returns {void} */
  function startOrientationMotion() {
    if (
      !supportsOrientationMotion ||
      hasOrientationPermissionGate ||
      sensorsListening ||
      reduceMotionQuery.matches
    ) {
      return;
    }

    window.addEventListener("deviceorientation", handleOrientation, {
      passive: true,
    });
    window.addEventListener("orientationchange", resetOrientationBaseline);
    sensorsListening = true;
  }

  /**
   * @param {HeroGradientHero} hero
   * @returns {HeroMotionController}
   */
  function createController(hero) {
    let targetPointX = DEFAULT_POINT_X;
    let targetPointY = DEFAULT_POINT_Y;
    let currentPointX = DEFAULT_POINT_X;
    let currentPointY = DEFAULT_POINT_Y;
    let targetBiasX = 0;
    let targetBiasY = 0;
    let currentBiasX = 0;
    let currentBiasY = 0;
    let targetShadowX = DEFAULT_POINT_X;
    let targetShadowY = DEFAULT_POINT_Y;
    let currentShadowX = DEFAULT_POINT_X;
    let currentShadowY = DEFAULT_POINT_Y;
    /** @type {number | null} */
    let rafId = null;

    function tick() {
      currentPointX += (targetPointX - currentPointX) * EASING;
      currentPointY += (targetPointY - currentPointY) * EASING;
      currentBiasX += (targetBiasX - currentBiasX) * EASING;
      currentBiasY += (targetBiasY - currentBiasY) * EASING;
      currentShadowX += (targetShadowX - currentShadowX) * EASING;
      currentShadowY += (targetShadowY - currentShadowY) * EASING;

      setVar(hero, "--hero-point-x", currentPointX);
      setVar(hero, "--hero-point-y", currentPointY);
      setVar(hero, "--hero-bias-x", currentBiasX);
      setVar(hero, "--hero-bias-y", currentBiasY);
      setVar(hero, "--hero-shadow-x", currentShadowX);
      setVar(hero, "--hero-shadow-y", currentShadowY);

      const pointDelta =
        Math.abs(targetPointX - currentPointX) +
        Math.abs(targetPointY - currentPointY);
      const biasDelta =
        Math.abs(targetBiasX - currentBiasX) +
        Math.abs(targetBiasY - currentBiasY);
      const shadowDelta =
        Math.abs(targetShadowX - currentShadowX) +
        Math.abs(targetShadowY - currentShadowY);

      if (pointDelta > 0.08 || biasDelta > 0.08 || shadowDelta > 0.08) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        currentPointX = targetPointX;
        currentPointY = targetPointY;
        currentBiasX = targetBiasX;
        currentBiasY = targetBiasY;
        currentShadowX = targetShadowX;
        currentShadowY = targetShadowY;
        setVar(hero, "--hero-point-x", currentPointX);
        setVar(hero, "--hero-point-y", currentPointY);
        setVar(hero, "--hero-bias-x", currentBiasX);
        setVar(hero, "--hero-bias-y", currentBiasY);
        setVar(hero, "--hero-shadow-x", currentShadowX);
        setVar(hero, "--hero-shadow-y", currentShadowY);
        rafId = null;
      }
    }

    function schedule() {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(tick);
      }
    }

    /**
     * @param {number} nextPointX
     * @param {number} nextPointY
     * @param {number} nextBiasX
     * @param {number} nextBiasY
     * @param {boolean} [immediate=false]
     * @returns {void}
     */
    function updateTargets(nextPointX, nextPointY, nextBiasX, nextBiasY, immediate = false) {
      targetPointX = clamp(nextPointX, 0, 100);
      targetPointY = clamp(nextPointY, 0, 100);
      targetBiasX = clamp(nextBiasX, -MAX_BIAS_X, MAX_BIAS_X);
      targetBiasY = clamp(nextBiasY, -MAX_BIAS_Y, MAX_BIAS_Y);
      targetShadowX = targetPointX;
      targetShadowY = targetPointY;

      if (immediate) {
        currentPointX = targetPointX;
        currentPointY = targetPointY;
        currentBiasX = targetBiasX;
        currentBiasY = targetBiasY;
        currentShadowX = targetShadowX;
        currentShadowY = targetShadowY;
        setVar(hero, "--hero-point-x", currentPointX);
        setVar(hero, "--hero-point-y", currentPointY);
        setVar(hero, "--hero-bias-x", currentBiasX);
        setVar(hero, "--hero-bias-y", currentBiasY);
        setVar(hero, "--hero-shadow-x", currentShadowX);
        setVar(hero, "--hero-shadow-y", currentShadowY);
        if (rafId !== null) {
          window.cancelAnimationFrame(rafId);
          rafId = null;
        }
        return;
      }

      schedule();
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {HeroMotionOptions} [options]
     * @returns {void}
     */
    function setCursorPosition(x, y, options = {}) {
      if (reduceMotionQuery.matches) {
        return;
      }

      updateTargets(x, y, targetBiasX, targetBiasY, Boolean(options.immediate));
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {HeroMotionOptions} [options]
     * @returns {void}
     */
    function setVector(x, y, options = {}) {
      if (reduceMotionQuery.matches) {
        return;
      }

      updateTargets(
        targetPointX,
        targetPointY,
        clamp(x, -1, 1) * MAX_BIAS_X,
        clamp(y, -1, 1) * MAX_BIAS_Y,
        Boolean(options.immediate)
      );
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {HeroMotionOptions} [options]
     * @returns {void}
     */
    function setMotion(x, y, options = {}) {
      if (reduceMotionQuery.matches) {
        return;
      }

      const pointX = DEFAULT_POINT_X + clamp(x, -1, 1) * MAX_POINT_SHIFT_X;
      const pointY = DEFAULT_POINT_Y + clamp(y, -1, 1) * MAX_POINT_SHIFT_Y;

      updateTargets(
        pointX,
        pointY,
        clamp(x, -1, 1) * MAX_BIAS_X,
        clamp(y, -1, 1) * MAX_BIAS_Y,
        Boolean(options.immediate)
      );
    }

    /** @returns {void} */
    function reset() {
      updateTargets(
        DEFAULT_POINT_X,
        DEFAULT_POINT_Y,
        0,
        0,
        false
      );
    }

    /**
     * @param {PointerEvent} event
     * @returns {void}
     */
    function handlePointerMove(event) {
      if (
        event.pointerType !== "mouse" &&
        event.pointerType !== "pen" &&
        event.pointerType !== "touch"
      ) {
        return;
      }

      const rect = hero.getBoundingClientRect();
      const cursorX = ((event.clientX - rect.left) / rect.width) * 100;
      const cursorY = ((event.clientY - rect.top) / rect.height) * 100;
      const centeredX = (cursorX - 50) / 50;
      const centeredY = (cursorY - 50) / 50;

      setCursorPosition(cursorX, cursorY);
      setVector(centeredX, centeredY);
    }

    hero.addEventListener("pointerenter", handlePointerMove);
    hero.addEventListener("pointermove", handlePointerMove);
    hero.addEventListener("pointerleave", reset);
    hero.addEventListener("pointercancel", reset);

    updateTargets(DEFAULT_POINT_X, DEFAULT_POINT_Y, 0, 0, true);

    /** @type {HeroMotionController} */
    const controller = {
      setCursorPosition,
      setMotion,
      setVector,
      reset,
    };

    return controller;
  }

  /** @returns {void} */
  function init() {
    const heroes = /** @type {NodeListOf<HeroGradientHero>} */ (
      document.querySelectorAll(HERO_SELECTOR)
    );

    heroes.forEach((hero) => {
      const controller = createController(hero);
      hero.heroGradientMotion = controller;
      controllers.add(controller);
    });

    startOrientationMotion();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
