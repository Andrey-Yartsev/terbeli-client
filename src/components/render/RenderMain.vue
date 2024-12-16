<template>
  <canvas id="canvas"></canvas>
</template>

<script>
import * as THREE from 'three'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
// import {GUI} from 'three/addons/libs/lil-gui.module.min.js'
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js'
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js'
import toast from '@/mixins/toast.js'
import ColorGUIHelper from './ColorGUIHelper.js'
import isTouchDevice from "@/mixins/isTouchDevice.js";

export default {
  mixins: [toast, isTouchDevice],
  // scene: null,
  // sceneInitialized: false,
  // renderer: null,
  // raycaster: null,
  // pointer: null,
  // lastX: 0,
  // currentHoveredPin: null,
  // movingRing: null,
  // pinsState: {},
  // ringOneStepYShift: 0.5,
  //sceneGeometries: [],
  props: {
    showPinDigits: false,
    demoMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isWin: false,
      allowRender: false
      // non-reactive:
      // scene: null,
      // sceneInitialized: false,
      // renderer: null,
      // raycaster: null,
      // pointer: null,
      // lastX: 0,
      // currentHoveredPin: null,
      // movingRing: null,
      // pinsState: {},
      // ringTickYShift: 0.5,
      // pinColor: '#FFE100',
      // pinColorHover: '#3CFF00',
      // globalPinN: 1
    }
  },
  computed: {
    turnPlayer() {
      return this.$store.state.player.turnPlayer
    },
    turnPlayerName() {
      return "Плеер " + this.turnPlayer
    },
    isMyTurn() {
      return this.$store.getters['player/isMyTurn']
    }
  },
  methods: {
    restart() {
      //this.renderer.domElement.removeEventListener("click", onClick)
      window.addEventListener('pointermove', this.onPointerMove)
    },
    addPlane() {
      const planeSize = 40
      const loader = new THREE.TextureLoader()
      const texture = loader.load('./img/plane-bg.png')
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.magFilter = THREE.NearestFilter
      texture.colorSpace = THREE.SRGBColorSpace
      const repeats = planeSize / 2
      texture.repeat.set(repeats, repeats)

      const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize)
      const planeMat = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
      })
      const mesh = new THREE.Mesh(planeGeo, planeMat)
      mesh.rotation.x = Math.PI * -.5
      this.scene.add(mesh)
    },
    initPinsState() {
      this.pinsState = {}
      for (let i = 1; i <= 16; i++) {
        // заполняем состояние штырей пустыми массивами
        this.pinsState[i] = []
      }
    },
    addPins() {
      this.initPinsState()
      for (let i = 1; i <= 16; i++) {
        const coords = this.getPinCoords(i)
        this.addPin(coords[0], coords[1])
      }
    },
    addPin(xOffset, zOffset) {
      const pinGeo = new THREE.CylinderGeometry(0.5, 0.5, 9.1, 32)
      const pinMat = new THREE.MeshPhongMaterial({color: this.pinColor})
      // const pinMat = new THREE.MeshBasicMaterial({color: 0x00ff00})
      const mesh = new THREE.Mesh(pinGeo, pinMat)
      zOffset = zOffset - 4
      xOffset = xOffset + 3
      mesh.position.set(0 + xOffset, 10 / 2 - 0.5, 0 + zOffset)
      mesh.userData.pin = true
      mesh.userData.pinN = this.globalPinN
      mesh.userData.ringsCount = 0
      this.scene.add(mesh)
      if (this.showPinDigits) {
        this.addText(xOffset, zOffset, this.globalPinN)
      }
      this.globalPinN++
      return mesh
    },
    addText(xOffset, zOffset, text) {
      const loader = new FontLoader()
      loader.load('./font.json', font => {
        const x = 0 + xOffset + 0, y = 10 / 2 + 6, z = 0 + zOffset
        const textGeo = new TextGeometry((text) + '', {
          font,
          size: 0.7,
          height: 0.05,
          curveSegments: 12,
          bevelEnabled: false,
          bevelThickness: 0.1,
          bevelSize: 0.1,
          bevelSegments: 0.1
        })
        const txtMat = new THREE.MeshPhongMaterial({color: '#000'})
        const mesh = new THREE.Mesh(textGeo, txtMat)
        mesh.position.x = x
        mesh.position.y = y - 2
        mesh.position.z = z
        mesh.rotateY(5)
        this.scene.add(mesh)
      })
    },
    canPutRingNotHas4(pinN) {
      return !this.pinsState[pinN] && this.pinsState[pinN].length < 4
    },
    canPutRing(pinN, toast = false) {
      if (this.demoMode) {
        return true
      }
      if (!this.$store.getters['player/isMyTurn']) {
        if (toast) {
          this.toast('Не твой ход')
        }
        console.log('cant put ring. not yo turn')
        return false
      } else if (this.canPutRingNotHas4(pinN)) {
        if (toast) {
          this.toast('Штырь заполнен')
        }
        console.log('cant put ring. more then 4')
        return false
      }
      return true
    },
    putRing(pinN) {
      if (!this.canPutRing(pinN)) {
        return
      }
      this._putRing(pinN)
    },
    _putRing(pinN) {
      const coords = this.getPinCoords(pinN)
      // при определении movingRing запускается анмация кольца
      // по её завершению срабатывает логика ringSetComplete
      this.movingRing = this.addRing(pinN, coords[0], coords[1])
    },
    putRingWs(turnPlayer, pinN) {
      this.forceTurnPlayer = turnPlayer
      this.putRingFromWs = false
      this._putRing(pinN)
    },
    addRing(pinN, xOffset, zOffset = 0) {
      const ringGeo = new THREE.CylinderGeometry(1, 1, 2, 32)
      const ringMat = new THREE.MeshPhongMaterial({color: this.getRingColor()})
      const mesh = new THREE.Mesh(ringGeo, ringMat)
      zOffset = zOffset - 4
      xOffset = xOffset + 3
      mesh.position.set(0 + xOffset, 10 / 2 + 7, 0 + zOffset)
      mesh.userData.pinN = pinN
      this.scene.add(mesh)
      this.sceneRings.push(mesh)
      return mesh
    },
    addTouchPinPointer(pinN) {
      if (!this.canPutRing(pinN, true)) {
        return
      }
      if (this.currentPinPointerMesh) {
        console.log('remove pin pointer')
        this.scene.remove(this.currentPinPointerMesh)
      }
      const coords = this.getPinCoords(pinN)
      let xOffset = coords[0]
      let zOffset = coords[1]
      const ringGeo = new THREE.CylinderGeometry(
          0.7, 0, 1, 32)
      const ringMat = new THREE.MeshPhongMaterial({color: '#3CFF00'})
      const mesh = new THREE.Mesh(ringGeo, ringMat)
      zOffset = zOffset - 4
      xOffset = xOffset + 3
      mesh.position.set(0 + xOffset, 10 / 2 + 4.7, 0 + zOffset)
      mesh.userData.pinN = pinN
      this.currentTouchPinN = pinN
      this.scene.add(mesh)
      this.currentPinPointerMesh = mesh
      this.$emit('setTouchPinPointer', true)
    },
    removeCurrentPinPointer() {
      this.scene.remove(this.currentPinPointerMesh)
    },
    touchPutRing() {
      this.putRing(this.currentTouchPinN)
      this.removeCurrentPinPointer()
      this.currentTouchPinN = undefined
    },
    getRingColor() {
      return this.turnPlayer === 1 ? "#F00" : "#00F"
    },
    getPinCoords(pinN) {
      const map = {
        1: [1, 0],
        2: [1, 3],
        3: [1, 6],
        4: [1, 9],
        5: [-2, 0],
        6: [-2, 3],
        7: [-2, 6],
        8: [-2, 9],
        9: [-5, 0],
        10: [-5, 3],
        11: [-5, 6],
        12: [-5, 9],
        13: [-8, 0],
        14: [-8, 3],
        15: [-8, 6],
        16: [-8, 9],
      }
      return map[pinN]
    },
    onClick() {
      if (this.isWin) {
        console.log('cant click this.isWin = true')
        return
      }
      if (!this.currentHoveredPin) {
        console.log('cant click this.currentHoveredPin = false')
        return
      }
      if (this.movingRing) {
        console.log('cant click moving')
        return
      }
      console.log('im happy now')
      this.putRing(this.currentHoveredPin.userData.pinN)
    },
    getTouchMouse(event) {
      const mouse = {}
      mouse.x = (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
      return mouse;
    },
    onTouchstart(event) {
      this.touchstartMouse = this.getTouchMouse(event)
    },
    onTouchend(event) {
      const mouse = this.getTouchMouse(event);
      if (this.touchstartMouse) {
        if (this.touchstartMouse.x !== mouse.x || this.touchstartMouse.y !== mouse.y) {
          // console.log('Произошло движение пальца')
          // Произошло движение пальца
          return;
        }
      }
      // Проверяем тач ли это по штырю
      this.raycaster.setFromCamera(mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children);
      if (!intersects.length) {
        return
      }
      if (!intersects[0].object.userData || !intersects[0].object.userData.pinN) {
        // это не штырь
        return
      }
      // console.log('Pin touch intersects:', intersects);
      this.addTouchPinPointer(intersects[0].object.userData.pinN)
    },
    getRingFinalY(pinN) {
      const ringsOnPin = this.pinsState[pinN].length
      const d = ringsOnPin + 1 % 4
      const i = d === 0 ? 4 : d
      const map = {
        1: 1,
        2: 3 + this.ringTickYShift,
        3: 5 + this.ringTickYShift * 2,
        4: 7 + this.ringTickYShift * 3
      }
      return map[i]
    },
    putRingComplete() {
      let turnPlayer = this.turnPlayer
      if (this.forceTurnPlayer) {
        turnPlayer = this.forceTurnPlayer
      }
      this.forceTurnPlayer = undefined

      // console.log('pushRing', this.movingRing.userData.pinN, turnPlayer)
      this.pinsState[this.movingRing.userData.pinN].push(turnPlayer)
      if (this.checkCurrentPlayerWins()) {
        this.win()
        return
      }
      if (this.isWin) {
        return
      }
      if (this.putRingFromWs) {
        this.$emit('addedRing', this.movingRing.userData.pinN)
        this.$emit('switchPlayer')
      } else {
        this.putRingFromWs = true
      }
    },
    checkCurrentPlayerWins() {
      const state = Object.values(this.pinsState)
      const debug = txt => {
        //console.log(txt)
      }
      const checkingPlayer = this.turnPlayer
      const horizontal1 = () => {
        let filled
        for (let y = 0; y < 1; y++) {
          for (let i = 0; i < 4; i++) {
            for (let x = 0; x < 4; x++) {
              filled = 0;
              for (let j = 0; j < 4; j++) {
                let n = j + (x * 4);
                if (state[n][i] === checkingPlayer) {
                  filled++;
                }
              }
              if (filled === 4) {
                debug('horizontal1')
                return true
              }
            }
          }
        }
        return false;
      };
      const horizontal2 = () => {
        let filled;
        for (let y = 0; y < 1; y++) {
          for (let i = 0; i < 4; i++) {
            for (let x = 0; x < 4; x++) {
              filled = 0;
              for (let j = 0; j < 4; j++) {
                let n = j * 4 + x;
                if (state[n][i] === checkingPlayer) {
                  filled++;
                }
              }
              if (filled === 4) {
                debug('horizontal2')
                return true
              }
            }
          }
        }
        return false
      }
      const horizontal = () => {
        return horizontal1() || horizontal2()
      }
      const vertical = () => {
        for (let n = 0; n < 16; n++) {
          let filled = 0;
          for (let j = 0; j < 4; j++) {
            if (state[n][j] === checkingPlayer) {
              filled++;
            }
          }
          if (filled === 4) {
            debug('vertical')
            return true
          }
        }
        return false
      }
      const diagonalHorizontal = () => {
        for (let i = 0; i < 4; i++) {
          if (
              state[0][i] === checkingPlayer &&
              state[5][i] === checkingPlayer &&
              state[10][i] === checkingPlayer &&
              state[15][i] === checkingPlayer
          ) {
            return true
          }
          if (
              state[3][i] === checkingPlayer &&
              state[6][i] === checkingPlayer &&
              state[9][i] === checkingPlayer &&
              state[12][i] === checkingPlayer
          ) {
            return true
          }
        }
      }
      // todo подписать каждый из методов
      const diagonalVertical = () => {
        for (let i = 0; i < 4; i++) {
          let filled = 0;
          for (let j = 0; j < 4; j++) {
            let n = j * 4 + i;
            if (state[n][j] === checkingPlayer) {
              filled++
            }
          }
          if (filled === 4) {
            debug('diagonalVertical-1')
            return true
          }
        }
        for (let i = 0; i < 4; i++) {
          let filled = 0;
          for (let j = 0; j < 4; j++) {
            let n = j * 4 + i;
            if (state[n][3 - j] === checkingPlayer) {
              filled++
            }
          }
          if (filled === 4) {
            debug('diagonalVertical-2')
            return true
          }
        }
        for (let i = 0; i < 4; i++) {
          let filled = 0;
          for (let j = 0; j < 4; j++) {
            let n = i * 4 + j;
            if (state[n][j] === checkingPlayer) {
              filled++
            }
          }
          if (filled === 4) {
            debug('diagonalVertical-3')
            return true
          }
        }
        for (let i = 0; i < 4; i++) {
          let filled = 0;
          for (let j = 0; j < 4; j++) {
            let n = i * 4 + j;
            if (state[n][3 - j] === checkingPlayer) {
              filled++
            }
          }
          if (filled === 4) {
            debug('diagonalVertical-4')
            return true
          }
        }
      }
      const diagonalVertical3d = () => {
        if (
            state[12][0] === checkingPlayer &&
            state[9][1] === checkingPlayer &&
            state[6][2] === checkingPlayer &&
            state[3][3] === checkingPlayer
        ) {
          debug('diagonalVertical3d')
          return true
        } else if (
            state[12][3] === checkingPlayer &&
            state[9][2] === checkingPlayer &&
            state[6][1] === checkingPlayer &&
            state[3][0] === checkingPlayer
        ) {
          debug('diagonalVertical3d')
          return true
        } else if (
            state[0][0] === checkingPlayer &&
            state[5][1] === checkingPlayer &&
            state[10][2] === checkingPlayer &&
            state[15][3] === checkingPlayer
        ) {
          debug('diagonalVertical3d')
          return true
        } else if (
            state[0][3] === checkingPlayer &&
            state[5][2] === checkingPlayer &&
            state[10][1] === checkingPlayer &&
            state[15][0] === checkingPlayer
        ) {
          debug('diagonalVertical3d')
          return true
        }
        return false
      }
      const diagonal = () => {
        return diagonalHorizontal() || diagonalVertical() || diagonalVertical3d()
      }
      if (horizontal() || vertical() || diagonal()) {
        // console.log('STATE', state)
        return true
      }
      return false
    },
    win() {
      this.isWin = true
      this.$emit('win')
      this.toast('Победа')
    },
    resizeRendererToDisplaySize() {
      const canvas = this.renderer.domElement
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const needResize = canvas.width !== width || canvas.height !== height
      if (needResize) {
        this.renderer.setSize(width, height, false)
      }
      return needResize
    },
    initCamera() {
      const fov = 60 // приближенность камеры
      const aspect = 2 // the canvas default
      const near = 0.1
      const far = 120
      this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
      this.camera.position.set(-25, 20, 10)
      // this.camera.aspect = this.renderer.domElement.clientWidth / this.renderer.domElement.clientHeight
      this.camera.updateProjectionMatrix()
    },
    addLight() {
      {

        const color = 0xFFFFFF
        const intensity = 1.5
        let light = new THREE.DirectionalLight(color, intensity)
        light.position.set(0, 3, 9)
        light.target.position.set(5, 0, 0)
        this.scene.add(light)
        this.scene.add(light.target)
        light.dispose()

        // const gui = new GUI()
        // gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color')
        // gui.add(light, 'intensity', 0, 5, 0.01)
        // gui.add(light.target.position, 'x', -10, 10, .01)
        // gui.add(light.target.position, 'z', -10, 10, .01)
        // gui.add(light.target.position, 'y', 0, 10, .01)
      }

      {
        const color = 0xFFFFFF
        const intensity = 1
        const light = new THREE.DirectionalLight(color, intensity)
        light.position.set(0, 30, 9)
        light.target.position.set(-5, 0, 0)
        this.scene.add(light)
        this.scene.add(light.target)
      }
    },
    onPointerMove(event) {
      this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1
      this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
    },
    renderTickIntersection() {
      if (this.isTouchDevice) {
        return
      }
      const intersects = this.raycaster.intersectObjects(this.scene.children)
      if (this.pointer.x !== 0 && this.lastX !== this.pointer.x && this.sceneInitialized && intersects.length > 0) {
        this.lastX = this.pointer.x
        if (intersects.length > 0) {
          if (intersects[0].object.userData.pin) {
            // Если навели на штырь
            if (this.userDragging) {
              return
            }
            if (!this.isMyTurn) {
              return
            }
            if (this.currentHoveredPin) {
              // если какой-то штырь горит
              if (this.currentHoveredPin.userData.pinN === intersects[0].object.userData.pinN) {
                // если горящий штырь совпадает с тем на который наверли - не делаем ничего
              } else {
                this.currentHoveredPin.material.color.set(this.pinColor)
                this.currentHoveredPin = intersects[0].object
                this.currentHoveredPin.material.color.set(this.pinColorHover)
                this.renderer.domElement.style.cursor = "pointer"
              }
            } else {
              // Если никокой штырь не подсвечен
              this.currentHoveredPin = intersects[0].object
              this.currentHoveredPin.material.color.set(this.pinColorHover)
              this.renderer.domElement.style.cursor = "pointer"
            }
          } else {
            if (this.currentHoveredPin !== null) {
              this.currentHoveredPin.material.color.set(this.pinColor)
              this.currentHoveredPin = null
              this.renderer.domElement.style.cursor = "default"
            }
          }
        }
      }
    },
    renderTickMoveRing() {
      if (this.movingRing) {
        let ringFinalY = this.getRingFinalY(this.movingRing.userData.pinN)
        if (this.movingRing.position.y > ringFinalY) {
          // тик анимации падения кольца
          this.movingRing.position.set(
              this.movingRing.position.x,
              this.movingRing.position.y - this.ringTickYShift,
              this.movingRing.position.z
          )
        } else {
          this.putRingComplete(this.movingRing)
          this.movingRing = null

        }
      }
    },
    render() {
      if (!this.allowRender) {
        return
      }
      this.raycaster.setFromCamera(this.pointer, this.camera)
      if (this.demoMode === false) {
        this.renderTickIntersection()
      }
      if (this.resizeRendererToDisplaySize()) {
        const canvas = this.renderer.domElement
        this.camera.aspect = canvas.clientWidth / canvas.clientHeight
        this.camera.updateProjectionMatrix()
      }
      this.renderer.render(this.scene, this.camera)
      this.renderTickMoveRing()
      window.requestAnimationFrame(this.render)
    },
    initConfig() {
      this.scene = null
      this.sceneInitialized = false
      this.renderer = null
      this.raycaster = null
      this.pointer = null
      this.lastX = 0
      this.currentHoveredPin = null
      this.movingRing = null
      this.pinsState = {}
      this.ringTickYShift = 0.5
      this.pinColor = '#FFE100'
      this.pinColorHover = '#3CFF00'
      this.globalPinN = 1
      this.userDragging = false
      this.putRingFromWs = true
      this.isWin = false
    },
    initScene() {
      const canvas = document.getElementById('canvas')
      this.renderer = new THREE.WebGLRenderer({antialias: true, canvas})

      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color('#4188BC')

      this.addLight()
      this.addPlane()
      this.addPins()

      this.raycaster = new THREE.Raycaster()
      this.pointer = new THREE.Vector2()

      this.sceneInitialized = false
      this.lastX = 0

      this.initCamera()

      const controls = new OrbitControls(this.camera, canvas)
      controls.target.set(0, 5, 0)
      controls.update()
      controls.addEventListener('start', () => {
        this.userDragging = true
      })
      this.renderer.domElement.addEventListener('touchstart', () => {
        this.userDragging = true
      })
      controls.addEventListener('end', () => {
        this.userDragging = false
      })
      this.renderer.domElement.addEventListener('touchend', () => {
        this.userDragging = false
      })

      window.addEventListener('pointermove', this.onPointerMove)
      window.requestAnimationFrame(this.render)
      setTimeout(() => {
        this.sceneInitialized = true
      }, 1500)

      if (!this.demoMode) {
        if (this.isMobile()) {
          this.renderer.domElement.addEventListener('touchstart', this.onTouchstart)
          this.renderer.domElement.addEventListener('touchend', this.onTouchend)
        } else {
          this.renderer.domElement.addEventListener('click', this.onClick)
        }
      }
    },
    start() {
      this.allowRender = true;
      this.initConfig()
      this.initScene()
    },
    reset() {
      for (let i = 0; i < this.sceneRings.length; i++) {
        this.scene.remove(this.sceneRings[i])
      }
      this.initPinsState()
      this.isWin = false
    },
    isMobile() {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true
      } else {
        return false
      }
    }
  },
  created() {
    this.sceneRings = []
  },
  async mounted() {
    // const r = await fetch('https://terbeli-server.onrender.com/api/users')
    //console.log(r)
  }
}
</script>

<style lang="sass">
#canvas
  width: 100%
  height: 100%
  display: block
  position: relative
</style>
