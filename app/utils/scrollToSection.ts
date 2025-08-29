export function scrollToSection(sectionId: string) {
  const section = document.getElementById(sectionId)
  if (section) {
    const navHeight = 80 // Assuming a fixed nav height of 80px
    const sectionTop = section.offsetTop - navHeight
    window.scrollTo({
      top: sectionTop,
      behavior: "smooth",
    })
  }
}
