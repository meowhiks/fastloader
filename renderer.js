
const programs = JSON.parse(localStorage.getItem("programs") || "[]")
const categories = JSON.parse(localStorage.getItem("categories") || "[]")
let settings = null


const launcherGrid = document.getElementById("launcher-grid")
const searchInput = document.getElementById("search-input")
const categoryFilter = document.getElementById("category-filter")
const addProgramBtn = document.getElementById("add-program-btn")
const addProgramSidebarBtn = document.getElementById("add-program-sidebar-btn")
const modal = document.getElementById("add-program-modal")
const editModal = document.getElementById("edit-program-modal")
const iconSelectionModal = document.getElementById("icon-selection-modal")
const closeModalBtn = document.querySelector(".close-modal")
const closeEditModalBtn = document.getElementById("close-edit-modal")
const closeIconModalBtn = document.getElementById("close-icon-modal")
const updateModal = document.getElementById("update-modal")
const closeUpdateModalBtn = document.getElementById("close-update-modal")
const cancelUpdateBtn = document.getElementById("cancel-update-btn")
const downloadUpdateBtn = document.getElementById("download-update-btn")
const installUpdateBtn = document.getElementById("install-update-btn")
const programNameInput = document.getElementById("program-name")
const programPathInput = document.getElementById("program-path")
const programCategorySelect = document.getElementById("program-category")
const editProgramNameInput = document.getElementById("edit-program-name")
const editProgramPathInput = document.getElementById("edit-program-path")
const editProgramCategorySelect = document.getElementById("edit-program-category")
const browseBtn = document.getElementById("browse-btn")
const editBrowseBtn = document.getElementById("edit-browse-btn")
const saveBtn = document.getElementById("save-program-btn")
const saveEditBtn = document.getElementById("save-edit-btn")
const cancelBtn = document.getElementById("cancel-add-btn")
const cancelEditBtn = document.getElementById("cancel-edit-btn")
const iconPreview = document.getElementById("icon-preview")
const editIconPreview = document.getElementById("edit-icon-preview")
const useDefaultIconBtn = document.getElementById("use-default-icon")
const useExtractedIconBtn = document.getElementById("use-extracted-icon")
const chooseCustomIconBtn = document.getElementById("choose-custom-icon")
const editUseDefaultIconBtn = document.getElementById("edit-use-default-icon")
const editUseExtractedIconBtn = document.getElementById("edit-use-extracted-icon")
const editChooseCustomIconBtn = document.getElementById("edit-choose-custom-icon")
const uploadCustomIconBtn = document.getElementById("upload-custom-icon")
const selectIconBtn = document.getElementById("select-icon-btn")
const cancelIconBtn = document.getElementById("cancel-icon-btn")
const iconGrid = document.getElementById("icon-grid")
const navItems = document.querySelectorAll(".nav-item")
const views = document.querySelectorAll(".view")
const themeOptions = document.querySelectorAll(".theme-option")
const opacityRange = document.getElementById("opacity-range")
const opacityValue = document.getElementById("opacity-value")
const appSizeSelect = document.getElementById("app-size-select")
const startupCheckbox = document.getElementById("startup-checkbox")
const minimizeCheckbox = document.getElementById("minimize-checkbox")
const startMinimizedCheckbox = document.getElementById("start-minimized-checkbox")
const exitAppBtn = document.getElementById("exit-app-btn")
const contextMenu = document.getElementById("context-menu")
const contextEdit = document.getElementById("context-edit")
const contextDelete = document.getElementById("context-delete")
const contextRun = document.getElementById("context-run")
const categoriesList = document.getElementById("categories-list")
const categoryNameInput = document.getElementById("category-name")
const categoryIconPreview = document.getElementById("category-icon-preview")
const selectCategoryIconBtn = document.getElementById("select-category-icon")
const addCategoryBtn = document.getElementById("add-category-btn")


const minimizeBtn = document.getElementById("minimize-btn")
const maximizeBtn = document.getElementById("maximize-btn")
const closeBtn = document.getElementById("close-btn")


let currentIconType = "default"
let extractedIconPath = null
let customIconPath = null
let customIconDataURL = null
let currentEditingIndex = -1
let currentIconSelectionTarget = null
let selectedIconClass = "fa-desktop"
let currentCategoryEditingIndex = -1
let draggedItem = null
let draggedItemType = null


function applyAppSize(size) {
  const launcherGrid = document.getElementById("launcher-grid")
  if (!launcherGrid) return


  launcherGrid.classList.remove("size-small", "size-medium", "size-large")


  launcherGrid.classList.add(`size-${size}`)
}


function setWindowOpacity(opacity) {

  const isDarkTheme = document.body.classList.contains("dark-theme")
  const isBlackTheme = document.body.classList.contains("black-theme")


  let bgColor = "245, 245, 250" // Светлая тема по умолчанию
  if (isBlackTheme) {
    bgColor = "0, 0, 0" // Чёрная тема
  } else if (isDarkTheme) {
    bgColor = "30, 30, 35" // Тёмная тема
  }


  const opacityValue = opacity / 100
  document.documentElement.style.setProperty("--background-opacity", opacityValue)
  document.querySelector(".app-container").style.backgroundColor = `rgba(${bgColor}, ${opacityValue})`
  

  document.documentElement.style.setProperty("--background-color", `rgba(${bgColor}, ${opacityValue})`)
}


async function loadSettings() {
  try {
    const loadedSettings = await window.electronAPI.getSettings()


  if (!loadedSettings) {
    settings = {
      theme: "light",
      opacity: 95,
      appSize: "medium",
      launchOnStartup: false,
      minimizeToTray: false,
      startMinimized: false,
    }
  } else {
    settings = loadedSettings
    if (settings.appSize === undefined) {
      settings.appSize = "medium"
    }
  }

    applySettings()
    return settings
  } catch (error) {
    console.error("Error loading settings:", error)
    settings = {
      theme: "light",
      opacity: 95,
      appSize: "medium",
      launchOnStartup: false,
      minimizeToTray: false,
      startMinimized: false,
    }
    applySettings()
    return settings
  }
}


function applySettings() {
  if (!settings) return


  document.body.classList.remove("dark-theme", "black-theme")

  if (settings.theme === "black") {
    document.body.classList.add("black-theme")
  } else if (
    settings.theme === "dark" ||
    (settings.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.body.classList.add("dark-theme")
  }


  themeOptions.forEach((option) => {
    option.classList.remove("active")
    if (option.dataset.theme === settings.theme) {
      option.classList.add("active")
    }
  })


  setWindowOpacity(settings.opacity)


  opacityRange.value = settings.opacity
  opacityValue.textContent = `${settings.opacity}%`


  applyAppSize(settings.appSize || "medium")


  if (appSizeSelect) {
    appSizeSelect.value = settings.appSize || "medium"
  }


  if (settings.launchOnStartup) {
    startupCheckbox.classList.add("checked")
  } else {
    startupCheckbox.classList.remove("checked")
  }

  if (settings.minimizeToTray) {
    minimizeCheckbox.classList.add("checked")
  } else {
    minimizeCheckbox.classList.remove("checked")
  }

  if (settings.startMinimized) {
    startMinimizedCheckbox.classList.add("checked")
  } else {
    startMinimizedCheckbox.classList.remove("checked")
  }


  if (settings.minimizeToTray) {
    window.electronAPI.createTray()
  }
}


async function saveSettings() {
  if (!settings) return

  try {
    const result = await window.electronAPI.saveSettings(settings)
    if (result.success) {
      applySettings()
      showNotification("Настройки сохранены", "success")
    } else {
      showNotification("Ошибка сохранения настроек: " + (result.error || "Неизвестная ошибка"), "error")
    }
  } catch (error) {
    console.error("Error saving settings:", error)
    showNotification("Ошибка сохранения настроек", "error")
  }
}


function populateCategoryDropdowns() {

  while (programCategorySelect.options.length > 1) {
    programCategorySelect.remove(1)
  }

  while (editProgramCategorySelect.options.length > 1) {
    editProgramCategorySelect.remove(1)
  }

  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1)
  }


  categories.forEach((category) => {
    const option1 = document.createElement("option")
    option1.value = category.id
    option1.textContent = category.name
    programCategorySelect.appendChild(option1)

    const option2 = document.createElement("option")
    option2.value = category.id
    option2.textContent = category.name
    editProgramCategorySelect.appendChild(option2)

    const option3 = document.createElement("option")
    option3.value = category.id
    option3.textContent = category.name
    categoryFilter.appendChild(option3)
  })
}


async function getImageDataURL(filePath) {
  if (!filePath) return null

  try {

    const dataURL = await window.electronAPI.readImageAsDataURL(filePath)
    return dataURL
  } catch (error) {
    console.error("Error converting image to data URL:", error)
    return null
  }
}


async function renderPrograms(programsToRender = programs, categoryId = "all") {
  launcherGrid.innerHTML = ""


  if (categoryId !== "all") {
    programsToRender = programsToRender.filter((program) => program.categoryId === categoryId)
  }

  if (programsToRender.length === 0) {
    launcherGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>Программы не найдены</p>
        <p>Нажмите кнопку + чтобы добавить программу</p>
      </div>
    `
    return
  }

  for (const program of programsToRender) {
    const programElement = document.createElement("div")
    programElement.className = "program-item animate__animated animate__fadeIn"
    programElement.dataset.index = programs.indexOf(program).toString()
    programElement.dataset.id = program.id

    let iconContent = ""


    if (program.iconType === "extracted") {
      if (program.iconDataURL) {
        iconContent = `<img src="${program.iconDataURL}" alt="${program.name}" />`
      } else {

        const category = categories.find((c) => c.id === program.categoryId)
        const iconClass = category ? category.iconClass : "fa-desktop"
        iconContent = `<i class="fas ${iconClass}"></i>`
      }
    } else if (program.iconType === "custom") {
      if (program.customIconDataURL) {
        iconContent = `<img src="${program.customIconDataURL}" alt="${program.name}" />`
      } else {

        const category = categories.find((c) => c.id === program.categoryId)
        const iconClass = category ? category.iconClass : "fa-desktop"
        iconContent = `<i class="fas ${iconClass}"></i>`
      }
    } else if (program.iconType === "fontawesome" && program.iconClass) {
      iconContent = `<i class="fas ${program.iconClass}"></i>`
    } else {

      const category = categories.find((c) => c.id === program.categoryId)
      const iconClass = category ? category.iconClass : "fa-desktop"
      iconContent = `<i class="fas ${iconClass}"></i>`
    }

    const categoryName =
      program.categoryId === "all"
        ? "Без категории"
        : categories.find((c) => c.id === program.categoryId)?.name || "Без категории"

    programElement.innerHTML = `
      <div class="program-icon">
        ${iconContent}
      </div>
      <div class="program-name">${program.name}</div>
      <div class="program-category">${categoryName}</div>
    `


    programElement.addEventListener("click", () => {
      launchProgram(program)
      programElement.classList.add("pulse")
      setTimeout(() => {
        programElement.classList.remove("pulse")
      }, 1500)
    })


    programElement.addEventListener("contextmenu", (e) => {
      e.preventDefault()
      showContextMenu(e.clientX, e.clientY, programElement.dataset.index)
    })


    programElement.setAttribute("draggable", "true")

    programElement.addEventListener("dragstart", (e) => {
      draggedItem = program
      draggedItemType = "program"
      programElement.classList.add("dragging")
      e.dataTransfer.setData("text/plain", program.id)
      e.dataTransfer.effectAllowed = "move"
    })

    programElement.addEventListener("dragend", () => {
      programElement.classList.remove("dragging")
      draggedItem = null
      draggedItemType = null
    })

    programElement.addEventListener("dragover", (e) => {
      e.preventDefault()
      if (draggedItemType === "program") {
        programElement.classList.add("drag-over")
      }
    })

    programElement.addEventListener("dragleave", () => {
      programElement.classList.remove("drag-over")
    })

    programElement.addEventListener("drop", (e) => {
      e.preventDefault()
      programElement.classList.remove("drag-over")

      if (draggedItemType === "program" && draggedItem && draggedItem.id !== program.id) {

        const draggedIndex = programs.findIndex((p) => p.id === draggedItem.id)
        const targetIndex = programs.findIndex((p) => p.id === program.id)

        if (draggedIndex !== -1 && targetIndex !== -1) {

          ;[programs[draggedIndex], programs[targetIndex]] = [programs[targetIndex], programs[draggedIndex]]


          savePrograms()
          renderPrograms(programsToRender, categoryId)
        }
      }
    })

    launcherGrid.appendChild(programElement)
  }
}


function renderCategories() {
  categoriesList.innerHTML = ""

  if (categories.length === 0) {
    categoriesList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-folder-open"></i>
        <p>Категории не созданы</p>
        <p>Создайте свою первую категорию</p>
      </div>
    `
    return
  }

  categories.forEach((category, index) => {
    const categoryElement = document.createElement("div")
    categoryElement.className = "category-item"
    categoryElement.dataset.index = index.toString()
    categoryElement.dataset.id = category.id

    categoryElement.innerHTML = `
      <div class="category-item-icon">
        <i class="fas ${category.iconClass || "fa-folder"}"></i>
      </div>
      <div class="category-item-name">${category.name}</div>
      <div class="category-item-actions">
        <button class="category-action-btn edit-category" data-index="${index}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="category-action-btn delete-category" data-index="${index}">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `


    categoryElement.setAttribute("draggable", "true")

    categoryElement.addEventListener("dragstart", (e) => {
      draggedItem = category
      draggedItemType = "category"
      categoryElement.classList.add("dragging")
      e.dataTransfer.setData("text/plain", category.id)
      e.dataTransfer.effectAllowed = "move"
    })

    categoryElement.addEventListener("dragend", () => {
      categoryElement.classList.remove("dragging")
      draggedItem = null
      draggedItemType = null
    })

    categoryElement.addEventListener("dragover", (e) => {
      e.preventDefault()
      if (draggedItemType === "category") {
        categoryElement.classList.add("drag-over")
      }
    })

    categoryElement.addEventListener("dragleave", () => {
      categoryElement.classList.remove("drag-over")
    })

    categoryElement.addEventListener("drop", (e) => {
      e.preventDefault()
      categoryElement.classList.remove("drag-over")

      if (draggedItemType === "category" && draggedItem && draggedItem.id !== category.id) {

        const draggedIndex = categories.findIndex((c) => c.id === draggedItem.id)
        const targetIndex = categories.findIndex((c) => c.id === category.id)

        if (draggedIndex !== -1 && targetIndex !== -1) {

          ;[categories[draggedIndex], categories[targetIndex]] = [categories[targetIndex], categories[draggedIndex]]


          saveCategories()
          renderCategories()
          populateCategoryDropdowns()
        }
      }
    })

    categoriesList.appendChild(categoryElement)
  })


  document.querySelectorAll(".edit-category").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number.parseInt(button.dataset.index)
      editCategory(index)
    })
  })

  document.querySelectorAll(".delete-category").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number.parseInt(button.dataset.index)
      deleteCategory(index)
    })
  })
}


async function launchProgram(program) {
  try {
    const result = await window.electronAPI.launchProgram(program.path)

    if (!result.success) {
      showNotification(`Не удалось запустить ${program.name}: ${result.error}`, "error")
    } else {
      showNotification(`Запущено: ${program.name}`, "success")
    }
  } catch (error) {
    showNotification(`Ошибка запуска программы: ${error.message}`, "error")
  }
}


function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification ${type} animate__animated animate__fadeInRight`
  notification.innerHTML = `
    <i class="fas ${type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-info-circle"}"></i>
    <span>${message}</span>
  `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.classList.remove("animate__fadeInRight")
    notification.classList.add("animate__fadeOutRight")
    setTimeout(() => {
      notification.remove()
    }, 500)
  }, 3000)
}


function showContextMenu(x, y, programIndex) {

  currentEditingIndex = Number.parseInt(programIndex)


  contextMenu.style.left = `${x}px`
  contextMenu.style.top = `${y}px`
  contextMenu.style.display = "block"


  document.addEventListener("click", hideContextMenu)
}


function hideContextMenu() {
  contextMenu.style.display = "none"
  document.removeEventListener("click", hideContextMenu)
}


function openAddProgramModal() {
  modal.classList.add("active")
  programNameInput.value = ""
  programPathInput.value = ""
  programCategorySelect.value = "all"
  iconPreview.innerHTML = '<i class="fas fa-desktop"></i>'
  useDefaultIconBtn.classList.add("active")
  useExtractedIconBtn.classList.remove("active")
  useExtractedIconBtn.disabled = true
  chooseCustomIconBtn.classList.remove("active")
  currentIconType = "default"
  extractedIconPath = null
  customIconPath = null
  customIconDataURL = null
}


function closeAddProgramModal() {
  modal.classList.remove("active")
}


async function openEditProgramModal(index) {
  if (index < 0 || index >= programs.length) return

  const program = programs[index]
  currentEditingIndex = index

  editProgramNameInput.value = program.name
  editProgramPathInput.value = program.path
  editProgramCategorySelect.value = program.categoryId || "all"


  if (program.iconType === "extracted" && program.iconPath) {

    if (!program.iconDataURL) {
      program.iconDataURL = await getImageDataURL(program.iconPath)
    }

    if (program.iconDataURL) {
      editIconPreview.innerHTML = `<img src="${program.iconDataURL}" alt="${program.name}" />`
      extractedIconPath = program.iconPath
    } else {

      const category = categories.find((c) => c.id === program.categoryId)
      const iconClass = category ? category.iconClass : "fa-desktop"
      editIconPreview.innerHTML = `<i class="fas ${iconClass}"></i>`
      program.iconType = "default" // Сбрасываем тип иконки
    }

    editUseDefaultIconBtn.classList.remove("active")
    editUseExtractedIconBtn.classList.add("active")
    editUseExtractedIconBtn.disabled = false
    editChooseCustomIconBtn.classList.remove("active")
  } else if (program.iconType === "custom" && program.customIconPath) {

    if (!program.customIconDataURL) {
      program.customIconDataURL = await getImageDataURL(program.customIconPath)
    }

    if (program.customIconDataURL) {
      editIconPreview.innerHTML = `<img src="${program.customIconDataURL}" alt="${program.name}" />`
      customIconPath = program.customIconPath
      customIconDataURL = program.customIconDataURL
    } else {

      const category = categories.find((c) => c.id === program.categoryId)
      const iconClass = category ? category.iconClass : "fa-desktop"
      editIconPreview.innerHTML = `<i class="fas ${iconClass}"></i>`
      program.iconType = "default" // Сбрасываем тип иконки
    }

    editUseDefaultIconBtn.classList.remove("active")
    editUseExtractedIconBtn.classList.remove("active")
    editChooseCustomIconBtn.classList.add("active")
  } else if (program.iconType === "fontawesome" && program.iconClass) {
    editIconPreview.innerHTML = `<i class="fas ${program.iconClass}"></i>`
    editUseDefaultIconBtn.classList.remove("active")
    editUseExtractedIconBtn.classList.remove("active")
    editChooseCustomIconBtn.classList.add("active")
    selectedIconClass = program.iconClass
  } else {

    const category = categories.find((c) => c.id === program.categoryId)
    const iconClass = category ? category.iconClass : "fa-desktop"
    editIconPreview.innerHTML = `<i class="fas ${iconClass}"></i>`
    editUseDefaultIconBtn.classList.add("active")
    editUseExtractedIconBtn.classList.remove("active")
    editChooseCustomIconBtn.classList.remove("active")
  }

  editModal.classList.add("active")
}


function closeEditProgramModal() {
  editModal.classList.remove("active")
  currentEditingIndex = -1
}


function openIconSelectionModal(target) {
  currentIconSelectionTarget = target


  document.querySelectorAll(".icon-item").forEach((item) => {
    item.classList.remove("selected")
  })


  if (target === "program" && currentIconType === "fontawesome") {
    const iconItem = document.querySelector(`.icon-item[data-icon="${selectedIconClass}"]`)
    if (iconItem) iconItem.classList.add("selected")
  } else if (target === "edit-program" && programs[currentEditingIndex]?.iconType === "fontawesome") {
    const iconClass = programs[currentEditingIndex].iconClass
    const iconItem = document.querySelector(`.icon-item[data-icon="${iconClass}"]`)
    if (iconItem) iconItem.classList.add("selected")
  } else if (target === "category") {
    const iconClass = currentCategoryEditingIndex >= 0 ? categories[currentCategoryEditingIndex].iconClass : "fa-folder"
    const iconItem = document.querySelector(`.icon-item[data-icon="${iconClass}"]`)
    if (iconItem) iconItem.classList.add("selected")
  }

  iconSelectionModal.classList.add("active")
}


function closeIconSelectionModal() {
  iconSelectionModal.classList.remove("active")
}


async function browseForProgram(isEdit = false) {
  try {
    const result = await window.electronAPI.selectFile()

    if (!result || result.canceled) {
      return
    }

    if (isEdit) {
      editProgramPathInput.value = result.filePath
      if (!editProgramNameInput.value) {
        editProgramNameInput.value = result.fileName
      }


      if (result.iconPath) {
        extractedIconPath = result.iconPath


        try {
          const iconDataURL = await window.electronAPI.readImageAsDataURL(result.iconPath)

          if (iconDataURL) {
            editUseExtractedIconBtn.disabled = false


            editUseDefaultIconBtn.classList.remove("active")
            editUseExtractedIconBtn.classList.add("active")
            editChooseCustomIconBtn.classList.remove("active")

            editIconPreview.innerHTML = `<img src="${iconDataURL}" alt="Extracted Icon" />`
          }
        } catch (error) {
          console.error("Failed to load extracted icon:", error)
        }
      }
    } else {
      programPathInput.value = result.filePath
      if (!programNameInput.value) {
        programNameInput.value = result.fileName
      }


      if (result.iconPath) {
        extractedIconPath = result.iconPath


        try {
          const iconDataURL = await window.electronAPI.readImageAsDataURL(result.iconPath)

          if (iconDataURL) {
            useExtractedIconBtn.disabled = false


            currentIconType = "extracted"
            useDefaultIconBtn.classList.remove("active")
            useExtractedIconBtn.classList.add("active")
            chooseCustomIconBtn.classList.remove("active")

            iconPreview.innerHTML = `<img src="${iconDataURL}" alt="Extracted Icon" />`
          }
        } catch (error) {
          console.error("Failed to load extracted icon:", error)
        }
      }
    }
  } catch (error) {
    console.error("Error selecting file:", error)
    showNotification(`Ошибка выбора файла: ${error.message}`, "error")
  }
}


async function browseForCustomIcon() {
  try {
    const result = await window.electronAPI.selectFile({
      isIconSelection: true,
      filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", "gif", "ico"] }],
    })

    if (!result || result.canceled) {
      return
    }

    customIconPath = result.filePath


    try {
      customIconDataURL = await window.electronAPI.readImageAsDataURL(result.filePath)

      if (customIconDataURL) {
        if (currentIconSelectionTarget === "program") {
          currentIconType = "custom"
          useDefaultIconBtn.classList.remove("active")
          useExtractedIconBtn.classList.remove("active")
          chooseCustomIconBtn.classList.add("active")
          iconPreview.innerHTML = `<img src="${customIconDataURL}" alt="Custom Icon" />`
        } else if (currentIconSelectionTarget === "edit-program") {
          editUseDefaultIconBtn.classList.remove("active")
          editUseExtractedIconBtn.classList.remove("active")
          editChooseCustomIconBtn.classList.add("active")
          editIconPreview.innerHTML = `<img src="${customIconDataURL}" alt="Custom Icon" />`
        }
      } else {
        showNotification("Не удалось загрузить выбранную иконку", "error")
      }
    } catch (error) {
      console.error("Failed to load custom icon:", error)
      showNotification("Не удалось загрузить выбранную иконку", "error")
    }

    closeIconSelectionModal()
  } catch (error) {
    console.error("Error selecting icon file:", error)
    showNotification(`Ошибка выбора иконки: ${error.message}`, "error")
  }
}


function selectFontAwesomeIcon() {
  const selectedItem = document.querySelector(".icon-item.selected")
  if (!selectedItem) {
    showNotification("Пожалуйста, выберите иконку", "error")
    return
  }

  const iconClass = selectedItem.dataset.icon

  if (currentIconSelectionTarget === "program") {
    currentIconType = "fontawesome"
    selectedIconClass = iconClass
    useDefaultIconBtn.classList.remove("active")
    useExtractedIconBtn.classList.remove("active")
    chooseCustomIconBtn.classList.add("active")
    iconPreview.innerHTML = `<i class="fas ${iconClass}"></i>`
  } else if (currentIconSelectionTarget === "edit-program") {
    editUseDefaultIconBtn.classList.remove("active")
    editUseExtractedIconBtn.classList.remove("active")
    editChooseCustomIconBtn.classList.add("active")
    editIconPreview.innerHTML = `<i class="fas ${iconClass}"></i>`
  } else if (currentIconSelectionTarget === "category") {
    categoryIconPreview.innerHTML = `<i class="fas ${iconClass}"></i>`
    selectedIconClass = iconClass
  }

  closeIconSelectionModal()
}


function addProgram() {
  const name = programNameInput.value.trim()
  const path = programPathInput.value.trim()
  const categoryId = programCategorySelect.value

  if (!name || !path) {
    showNotification("Пожалуйста, введите название и путь к программе.", "error")
    return
  }

  const newProgram = {
    id: Date.now().toString(),
    name,
    path,
    categoryId,
    iconType: currentIconType,
  }

  if (currentIconType === "extracted" && extractedIconPath) {
    newProgram.iconPath = extractedIconPath
    newProgram.iconDataURL = iconPreview.querySelector("img")?.src || null
  } else if (currentIconType === "custom" && customIconPath) {
    newProgram.customIconPath = customIconPath
    newProgram.customIconDataURL = customIconDataURL
  } else if (currentIconType === "fontawesome" && selectedIconClass) {
    newProgram.iconClass = selectedIconClass
  }

  programs.push(newProgram)
  savePrograms()
  renderPrograms()
  closeAddProgramModal()
  showNotification(`${name} успешно добавлено!`, "success")
}


function saveEditedProgram() {
  if (currentEditingIndex < 0 || currentEditingIndex >= programs.length) return

  const name = editProgramNameInput.value.trim()
  const path = editProgramPathInput.value.trim()
  const categoryId = editProgramCategorySelect.value

  if (!name || !path) {
    showNotification("Пожалуйста, введите название и путь к программе.", "error")
    return
  }

  const program = programs[currentEditingIndex]


  let iconType = "default"
  if (editUseExtractedIconBtn.classList.contains("active")) {
    iconType = "extracted"
  } else if (editChooseCustomIconBtn.classList.contains("active")) {

    if (editIconPreview.querySelector("img")) {
      iconType = "custom"
    } else {
      iconType = "fontawesome"
    }
  }


  programs[currentEditingIndex] = {
    ...program,
    name,
    path,
    categoryId,
    iconType,
  }


  if (iconType === "extracted" && extractedIconPath) {
    programs[currentEditingIndex].iconPath = extractedIconPath
    programs[currentEditingIndex].iconDataURL = editIconPreview.querySelector("img")?.src || null
  } else if (iconType === "custom" && customIconPath) {
    programs[currentEditingIndex].customIconPath = customIconPath
    programs[currentEditingIndex].customIconDataURL = customIconDataURL
  } else if (iconType === "fontawesome") {

    const iconElement = editIconPreview.querySelector("i")
    if (iconElement) {
      const classList = iconElement.className.split(" ")
      const faClass = classList.find((cls) => cls.startsWith("fa-"))
      if (faClass) {
        programs[currentEditingIndex].iconClass = faClass
      }
    }
  }

  savePrograms()
  renderPrograms()
  closeEditProgramModal()
  showNotification(`${name} успешно обновлено!`, "success")
}


function deleteProgram(index) {
  if (index < 0 || index >= programs.length) return

  const programName = programs[index].name
  programs.splice(index, 1)
  savePrograms()
  renderPrograms()
  showNotification(`${programName} успешно удалено!`, "success")
}


function addCategory() {
  const name = categoryNameInput.value.trim()

  if (!name) {
    showNotification("Пожалуйста, введите название категории.", "error")
    return
  }

  const newCategory = {
    id: Date.now().toString(),
    name,
    iconClass: selectedIconClass || "fa-folder",
  }

  if (currentCategoryEditingIndex >= 0) {

    categories[currentCategoryEditingIndex] = newCategory
    showNotification(`Категория "${name}" обновлена!`, "success")
  } else {

    categories.push(newCategory)
    showNotification(`Категория "${name}" добавлена!`, "success")
  }

  saveCategories()
  renderCategories()
  populateCategoryDropdowns()


  categoryNameInput.value = ""
  categoryIconPreview.innerHTML = '<i class="fas fa-folder"></i>'
  selectedIconClass = "fa-folder"
  currentCategoryEditingIndex = -1
}


function editCategory(index) {
  if (index < 0 || index >= categories.length) return

  const category = categories[index]
  currentCategoryEditingIndex = index

  categoryNameInput.value = category.name
  categoryIconPreview.innerHTML = `<i class="fas ${category.iconClass || "fa-folder"}"></i>`
  selectedIconClass = category.iconClass || "fa-folder"


  document.querySelector(".add-category-form").scrollIntoView({ behavior: "smooth" })
}


function deleteCategory(index) {
  if (index < 0 || index >= categories.length) return

  const categoryName = categories[index].name
  const categoryId = categories[index].id


  categories.splice(index, 1)


  programs.forEach((program) => {
    if (program.categoryId === categoryId) {
      program.categoryId = "all"
    }
  })

  saveCategories()
  savePrograms()
  renderCategories()
  populateCategoryDropdowns()
  renderPrograms()

  showNotification(`Категория успешно удалена!`, "success")
}


function savePrograms() {
  localStorage.setItem("programs", JSON.stringify(programs))
}


function saveCategories() {
  localStorage.setItem("categories", JSON.stringify(categories))
}


function filterPrograms() {
  const searchTerm = searchInput.value.toLowerCase()
  const categoryId = categoryFilter.value

  let filtered = programs


  if (searchTerm) {
    filtered = filtered.filter((program) => program.name.toLowerCase().includes(searchTerm))
  }


  renderPrograms(filtered, categoryId)
}


function switchView(viewId) {
  views.forEach((view) => {
    view.classList.remove("active")
  })

  document.getElementById(`${viewId}-view`).classList.add("active")

  navItems.forEach((item) => {
    item.classList.remove("active")
  })

  document.querySelector(`.nav-item[data-view="${viewId}"]`).classList.add("active")
}


function toggleCheckbox(checkbox, settingName) {
  if (!settings) return

  if (checkbox.classList.contains("checked")) {
    checkbox.classList.remove("checked")
    settings[settingName] = false
  } else {
    checkbox.classList.add("checked")
    settings[settingName] = true
  }


  saveSettings()
}


addProgramBtn.addEventListener("click", openAddProgramModal)
addProgramSidebarBtn.addEventListener("click", openAddProgramModal)
closeModalBtn.addEventListener("click", closeAddProgramModal)
closeEditModalBtn.addEventListener("click", closeEditProgramModal)
closeIconModalBtn.addEventListener("click", closeIconSelectionModal)
browseBtn.addEventListener("click", () => browseForProgram(false))
editBrowseBtn.addEventListener("click", () => browseForProgram(true))
saveBtn.addEventListener("click", addProgram)
saveEditBtn.addEventListener("click", saveEditedProgram)
cancelBtn.addEventListener("click", closeAddProgramModal)
cancelEditBtn.addEventListener("click", closeEditProgramModal)
uploadCustomIconBtn.addEventListener("click", browseForCustomIcon)
selectIconBtn.addEventListener("click", selectFontAwesomeIcon)
cancelIconBtn.addEventListener("click", closeIconSelectionModal)
addCategoryBtn.addEventListener("click", addCategory)
selectCategoryIconBtn.addEventListener("click", () => openIconSelectionModal("category"))


exitAppBtn.addEventListener("click", () => {
  window.electronAPI.windowControl("quit")
})


useDefaultIconBtn.addEventListener("click", () => {
  currentIconType = "default"
  useDefaultIconBtn.classList.add("active")
  useExtractedIconBtn.classList.remove("active")
  chooseCustomIconBtn.classList.remove("active")

  const category = categories.find((c) => c.id === programCategorySelect.value)
  const iconClass = category ? category.iconClass : "fa-desktop"
  iconPreview.innerHTML = `<i class="fas ${iconClass}"></i>`
})

useExtractedIconBtn.addEventListener("click", () => {
  if (extractedIconPath) {
    currentIconType = "extracted"
    useDefaultIconBtn.classList.remove("active")
    useExtractedIconBtn.classList.add("active")
    chooseCustomIconBtn.classList.remove("active")
    iconPreview.innerHTML = `<img src="${iconPreview.querySelector("img")?.src}" alt="Extracted Icon" />`
  }
})

chooseCustomIconBtn.addEventListener("click", () => {
  openIconSelectionModal("program")
})

editUseDefaultIconBtn.addEventListener("click", () => {
  editUseDefaultIconBtn.classList.add("active")
  editUseExtractedIconBtn.classList.remove("active")
  editChooseCustomIconBtn.classList.remove("active")

  const category = categories.find((c) => c.id === editProgramCategorySelect.value)
  const iconClass = category ? category.iconClass : "fa-desktop"
  editIconPreview.innerHTML = `<i class="fas ${iconClass}"></i>`
})

editUseExtractedIconBtn.addEventListener("click", () => {
  if (extractedIconPath || programs[currentEditingIndex]?.iconPath) {
    editUseDefaultIconBtn.classList.remove("active")
    editUseExtractedIconBtn.classList.add("active")
    editChooseCustomIconBtn.classList.remove("active")

    const iconPath = extractedIconPath || programs[currentEditingIndex].iconPath
    const iconDataURL = programs[currentEditingIndex].iconDataURL

    if (iconDataURL) {
      editIconPreview.innerHTML = `<img src="${iconDataURL}" alt="Extracted Icon" />`
    } else {

      getImageDataURL(iconPath).then((dataURL) => {
        if (dataURL) {
          editIconPreview.innerHTML = `<img src="${dataURL}" alt="Extracted Icon" />`
          programs[currentEditingIndex].iconDataURL = dataURL
        }
      })
    }
  }
})

editChooseCustomIconBtn.addEventListener("click", () => {
  openIconSelectionModal("edit-program")
})


document.querySelectorAll(".icon-item").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".icon-item").forEach((i) => i.classList.remove("selected"))
    item.classList.add("selected")
  })
})


contextEdit.addEventListener("click", () => {
  openEditProgramModal(currentEditingIndex)
})

contextDelete.addEventListener("click", () => {
  deleteProgram(currentEditingIndex)
})

contextRun.addEventListener("click", () => {
  if (currentEditingIndex >= 0 && currentEditingIndex < programs.length) {
    launchProgram(programs[currentEditingIndex])
  }
})


startupCheckbox.addEventListener("click", () => {
  toggleCheckbox(startupCheckbox, "launchOnStartup")
})

minimizeCheckbox.addEventListener("click", () => {
  toggleCheckbox(minimizeCheckbox, "minimizeToTray")
})

startMinimizedCheckbox.addEventListener("click", () => {
  toggleCheckbox(startMinimizedCheckbox, "startMinimized")
})



themeOptions.forEach((option) => {
  option.addEventListener("click", () => {
    if (!settings) return
    settings.theme = option.dataset.theme
    applySettings()
    saveSettings()
  })
})


opacityRange.addEventListener("input", (e) => {
  if (!settings) return
  settings.opacity = Number.parseInt(e.target.value)
  opacityValue.textContent = `${e.target.value}%`


  setWindowOpacity(settings.opacity)
})


opacityRange.addEventListener("change", () => {
  if (settings) {
    saveSettings()
  }
})


if (appSizeSelect) {
  appSizeSelect.addEventListener("change", (e) => {
    if (!settings) return
    settings.appSize = e.target.value
    applyAppSize(settings.appSize)
    saveSettings()
  })
}


navItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault()
    const viewId = item.dataset.view
    switchView(viewId)
  })
})


searchInput.addEventListener("input", filterPrograms)
categoryFilter.addEventListener("change", filterPrograms)


minimizeBtn.addEventListener("click", () => {
  window.electronAPI.windowControl("minimize")
})

maximizeBtn.addEventListener("click", () => {
  window.electronAPI.windowControl("maximize")
})


closeBtn.addEventListener("click", () => {

  if (settings && settings.minimizeToTray) {
    window.electronAPI.windowControl("close")
  } else {

    window.electronAPI.windowControl("quit")
  }
})


document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    hideContextMenu()
    if (modal.classList.contains("active")) {
      closeAddProgramModal()
    }
    if (editModal.classList.contains("active")) {
      closeEditProgramModal()
    }
    if (iconSelectionModal.classList.contains("active")) {
      closeIconSelectionModal()
    }
  }
})


async function initialize() {
  try {

    await loadSettings()


    try {
      const appVersion = await window.electronAPI.getAppVersion()
      const versionElement = document.querySelector(".version")
      if (versionElement && appVersion) {
        versionElement.textContent = `Версия ${appVersion}`
      }
    } catch (error) {
      console.error("Error getting app version:", error)
    }


    populateCategoryDropdowns()
    renderCategories()


    for (const program of programs) {
      if (program.iconType === "extracted" && program.iconPath && !program.iconDataURL) {
        try {
          program.iconDataURL = await window.electronAPI.readImageAsDataURL(program.iconPath)
        } catch (error) {
          console.error("Failed to load extracted icon:", error)
        }
      }

      if (program.iconType === "custom" && program.customIconPath && !program.customIconDataURL) {
        try {
          program.customIconDataURL = await window.electronAPI.readImageAsDataURL(program.customIconPath)
        } catch (error) {
          console.error("Failed to load custom icon:", error)
        }
      }
    }


    savePrograms()


    renderPrograms()
  } catch (error) {
    console.error("Initialization error:", error)

    populateCategoryDropdowns()
    renderCategories()
    renderPrograms()
  }
}


function showUpdateModal() {
  if (updateModal) {
    updateModal.classList.add("active")
  }
}

function hideUpdateModal() {
  if (updateModal) {
    updateModal.classList.remove("active")
  }
}

function showUpdateStatus(status, data = {}) {

  const statusDivs = ["update-checking", "update-available", "update-not-available", "update-error"]
  statusDivs.forEach((id) => {
    const div = document.getElementById(id)
    if (div) div.style.display = "none"
  })


  if (downloadUpdateBtn) downloadUpdateBtn.style.display = "none"
  if (installUpdateBtn) installUpdateBtn.style.display = "none"

  switch (status) {
    case "checking":
      document.getElementById("update-checking").style.display = "block"
      break
    case "available":
      document.getElementById("update-available").style.display = "block"
      if (data.version) {
        document.getElementById("update-version").textContent = data.version
      }
      if (data.releaseNotes) {
        const notesDiv = document.getElementById("update-release-notes")
        if (notesDiv) {
          notesDiv.innerHTML = Array.isArray(data.releaseNotes)
            ? data.releaseNotes.join("<br>")
            : data.releaseNotes
        }
      }
      if (downloadUpdateBtn) downloadUpdateBtn.style.display = "inline-block"
      showUpdateModal()
      break
    case "not-available":
      document.getElementById("update-not-available").style.display = "block"
      break
    case "error":
      document.getElementById("update-error").style.display = "block"
      if (data.message) {
        document.getElementById("update-error-message").textContent = data.message
      }
      break
    case "downloaded":
      document.getElementById("update-downloaded").style.display = "block"
      document.getElementById("update-progress-container").style.display = "none"
      if (installUpdateBtn) installUpdateBtn.style.display = "inline-block"
      if (downloadUpdateBtn) downloadUpdateBtn.style.display = "none"
      showUpdateModal()
      break
  }
}

function updateDownloadProgress(percent) {
  const progressBar = document.getElementById("update-progress-bar")
  const progressPercent = document.getElementById("update-progress-percent")
  const progressContainer = document.getElementById("update-progress-container")

  if (progressBar) {
    progressBar.style.width = `${percent}%`
  }
  if (progressPercent) {
    progressPercent.textContent = `${Math.round(percent)}%`
  }
  if (progressContainer) {
    progressContainer.style.display = "block"
  }
}

async function checkForUpdates() {
  try {
    showUpdateStatus("checking")
    showUpdateModal()
    const result = await window.electronAPI.checkForUpdates()
    if (!result.success) {
      showUpdateStatus("error", { message: result.message || "Ошибка при проверке обновлений" })
      showUpdateModal()
    }
  } catch (error) {
    console.error("Error checking for updates:", error)
    showUpdateStatus("error", { message: error.message || "Ошибка при проверке обновлений" })
    showUpdateModal()
  }
}

async function downloadUpdate() {
  try {
    showUpdateStatus("available")
    updateDownloadProgress(0)
    const result = await window.electronAPI.downloadUpdate()
    if (!result.success) {
      showUpdateStatus("error", { message: result.message || "Ошибка при загрузке обновления" })
    }
  } catch (error) {
    console.error("Error downloading update:", error)
    showUpdateStatus("error", { message: error.message || "Ошибка при загрузке обновления" })
  }
}

async function installUpdate() {
  try {
    const result = await window.electronAPI.installUpdate()
    if (!result.success) {
      showNotification("Ошибка при установке обновления: " + (result.message || "Неизвестная ошибка"), "error")
    }
  } catch (error) {
    console.error("Error installing update:", error)
    showNotification("Ошибка при установке обновления: " + error.message, "error")
  }
}


if (window.electronAPI) {
  window.electronAPI.onUpdateStatus((data) => {
    showUpdateStatus(data.status, data)
  })

  window.electronAPI.onUpdateProgress((data) => {
    updateDownloadProgress(data.percent)
  })
}


if (closeUpdateModalBtn) {
  closeUpdateModalBtn.addEventListener("click", hideUpdateModal)
}

if (cancelUpdateBtn) {
  cancelUpdateBtn.addEventListener("click", hideUpdateModal)
}

if (downloadUpdateBtn) {
  downloadUpdateBtn.addEventListener("click", downloadUpdate)
}

if (installUpdateBtn) {
  installUpdateBtn.addEventListener("click", installUpdate)
}


async function addUpdateCheckButton() {
  const settingActions = document.querySelector(".setting-actions")
  if (settingActions) {
    const checkUpdateBtn = document.createElement("button")
    checkUpdateBtn.id = "check-updates-btn"
    checkUpdateBtn.className = "btn btn-secondary"
    checkUpdateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Проверить обновления'
    checkUpdateBtn.style.marginRight = "10px"
    checkUpdateBtn.addEventListener("click", checkForUpdates)
    settingActions.insertBefore(checkUpdateBtn, settingActions.firstChild)
  }
}


if (window.electronAPI && window.electronAPI.onProgramLaunched) {
  window.electronAPI.onProgramLaunched((data) => {
    if (data && data.programId) {
      trackProgramUsage(data.programId)
    }
  })
}

document.addEventListener("DOMContentLoaded", () => {
  initialize()
  addUpdateCheckButton()
  saveProgramsToFile()
})

