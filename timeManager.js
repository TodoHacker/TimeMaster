let countdownBtn = document.getElementById("countdown")
let started = false

countdownBtn.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: startCountDown
  })
})

function startCountDown() {
  const timeBlock = document.createElement('div')
  timeBlock.id = 'timeBlock'
  timeBlock.style = `
    font-size: 24px;
    color: #000000;
    position: fixed;
    top: 40px;
    right: 40px;
    opacity: 0.8;
    z-index: 9999;
  `
  document.body.appendChild(timeBlock)
  const WorkerString = `
    self.startTime = null
    self.requestAnimationFrameInstance = null
    self.restTime = 60 * 60 * 1000
    
    self.timeAction = function () {
      const seconds = Math.ceil(self.restTime / 1000)
      self.restTime = 60 * 60 * 1000 - (new Date() - self.startTime)
      const currentSeconds = Math.ceil(self.restTime / 1000)
      if (currentSeconds < seconds) {
        const secondsNum = currentSeconds % 60
        const minutesNum = (currentSeconds - secondsNum) / 60
        self.postMessage(\`\${minutesNum} : \${secondsNum}\`)
      }
      self.requestAnimationFrameInstance = requestAnimationFrame(self.timeAction)
    }

    self.addEventListener('message', function (webMessage) {
      if (webMessage.data === 'start') {
        self.startTime = new Date()
        self.requestAnimationFrameInstance = requestAnimationFrame(self.timeAction)
      }
    })
  `
  const workerInstance = new Worker(URL.createObjectURL(
    new Blob([WorkerString], { type: "application/javascript" })
  ))
  workerInstance.addEventListener('message', function (workerMessage) {
    timeBlock.innerText = workerMessage.data
  })

  workerInstance.postMessage('start')
}
