import { _decorator, assetManager, Component, Label, math, Node, SpriteFrame, Texture2D, UITransform } from 'cc';

/**
 * 动态加载资源
 * @param type 资源类型
 * @param name 资源名称 
 * @returns SpriteFrame
 */
export function getManager({ type = 'texture', name }): any {
  const typeObj = {
    texture: Texture2D
  }
  const spriteFrame = new SpriteFrame()
  return new Promise(resolve => {
    assetManager.loadBundle(type, (err, boundle) => {
      if (err) {
        resolve(spriteFrame)
      }
      boundle.load(`${name}/${type}`, typeObj[type], (err, texture: any) => {
        if (err) {
          resolve(null)
        }
        spriteFrame.texture = texture
        resolve(spriteFrame)
      })
    })
  })
}

/**
 * 获取节点宽、高
 * @param node 节点
 * @returns Object
 */
export function getBounding(node):math.Size {
  return node.getComponent(UITransform).contentSize;
}

/**
 * 设置节点的宽高
 * @param node 节点
 * @param width 节点的宽
 * @param height 节点的高
 */
export function setNodeSize(node: Node, width: number = 0, height: number = 0): void {
  const _UITransform = node.getComponent(UITransform)
  _UITransform.width = width === 0 ? _UITransform.width : width
  _UITransform.height = height === 0 ? _UITransform.height : height
}

/**
 * 获取 label 的宽度
 * @param node 节点
 * @param str 显示内容
 * @param proportion 与真实宽度相差的数量
 * @returns Number
 */
export function getLabelWidth(node, str, proportion = 0) {
  const fontSize = node.getComponent(Label).fontSize
  str = String(str)
  return fontSize * str.length - (str.length * proportion)
}

/**
 * 判断是否为对象
 * @param obj 
 * @returns Boolean
 */
export function isObj(obj): Boolean {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

/**
 * 
 * @param val 传入的值
 * @returns Boolean
 */
export function isEmptyValue(val): Boolean {
  if (val === null || val === undefined || !String(val).trim().length) {
    return true
  }
  return false
}


/**
 * 补零，如果小于10就再数字前面加一个零
 * @param n 操作的数值
 * @returns String
 */
export function zeroFill (n) {
  n = n < 10 ? `0${n}` : String(n)
  return n
}

/**
 * 通过秒转换成 hh:mm:ss 显示
 * @param nums 秒数
 * @returns String
 */
export function secondsChange (nums: number) {
  let hours: any = '00'
  let minutes:any = zeroFill(Math.floor(nums / 60))
  let seconds = zeroFill(nums % 60)

  if (minutes > 60) {
    hours = zeroFill(Math.floor(minutes / 60))
    minutes = zeroFill(minutes % 60)
  }

  return `${hours}:${minutes}:${seconds}`
}

/**
 * 首字母转换
 * @param str 需要转换的内容 
 * @param type big 首字母转换为大写
 * @returns String
 */
export function initialChange (str: string, type: string = 'big') {
  if (type === 'big') {
    return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase()
  } else {
    return str.toLowerCase()
  }
}

// 将相对坐标转换成世界坐标
export function convertToWorldSpaceAR(node, position, outPosition) {
  node.getComponent(UITransform).convertToWorldSpaceAR(position, outPosition)
}

// 将世界坐标转换成依某节点的相对坐标
export function convertToNodeSpaceAR(node, position, outPosition) {
  node.getComponent(UITransform).convertToNodeSpaceAR(position, outPosition)
}
