var DEBUG = true

$(function () {
  var animation_speed = 200;
//  var animation_speed = 4000;
  
  //initialize navi view state 
  setNaviViewState()

  $(".collapsible_megamenu .menu-toggler-btn").click(function (e) {
    e.stopPropagation() //stop event propagation to prevent call to clear indicators
    
    if (DEBUG) console.log("hamburger button clicked")

    var navi = $(this).closest('.collapsible_megamenu')
    var menulist = navi.find(".menu-list")

    if (isMenuDisplayed(menulist)) {
      animateMenuList('hide', menulist, navi)
    }
    else {
      animateMenuList('show', menulist, navi)
    }
  })

  $(".collapsible_megamenu li").click(function (e) {
    e.stopPropagation() //stop event propagation to prevent call to clear indicators

    if (DEBUG) console.log("menuitem clicked")
    
    //skip if menu-toggler is clicked
    if ($(this).hasClass('menu-toggler')) {
      return;
    }

    //skip if backdrop (menu-list) is clicked
    if ($(this).hasClass('menu-list')) {
      //close collapsed menu if clicked on backdrop
      $('.collapsible_megamenu .menu-list .backdrop').click(function () {
        e.stopPropagation() //stop event propagation to prevent call to clear indicators

        if (DEBUG)
          console.log("backdrop clicked")

        var navi = $(this).closest('.collapsible_megamenu')
        var menulist = navi.find(".menu-list")

        if (isMenuDisplayed(menulist)) {
          animateMenuList('hide', menulist, navi)
        }

      })

      return;
    }
    
    //skip if backdrop is clicked
    if ($(this).hasClass('backdrop')) {
      return;
    }
    
    var navi = $(this).closest('.collapsible_megamenu')
    var menulist = navi.find(".menu-list")

    var selection = $(this)
    var goForward = true

    // go back if selected li is clicked (nav back)
    if ($(this).hasClass('selected')) {
      selection = $(this).closest('li:not(".selected")')
      goForward = false
    }

    //exit if no more children to show
    if (!selection.hasClass('has-children') && !selection.hasClass('menu-list')) {
      clearSelection(menulist)
      return
    }

    showNextMenu(menulist, navi, selection, goForward);
  })

  // for mega menu hover event
  $(".collapsible_megamenu .menu-list >ul >li.has-children").hover(function (e) {
//    e.stopPropagation() //stop event propagation to prevent call to clear indicators
    if (DEBUG) console.log("hovered on menuitem with children")

    var navi = $(this).closest('.collapsible_megamenu')
    var menulist = navi.find(".menu-list")

    //ignore if not in megamenu mode
    if (!navi.hasClass('megamenu')) {
      return
    }

    //ignore if hover on self
    if ($(this).hasClass('selected')) {
      return
    }

    clearSelection(menulist)
  })

  //close collapsed menu if clicked anywhere else aside from menu
  $(document).click(function () {
    //when clicked outside navigation elements
    if (DEBUG) console.log("clicked on document")

    $('.collapsible_megamenu').each(function(){
      var navi = $(this)
      var menulist = navi.find(".menu-list")
      
      if (isMenuDisplayed(menulist)) {
        animateMenuList('hide', menulist, navi)
      }
    })

  })

  //set view state on window resize
  $(window).resize(setNaviViewState)
  
  function setNaviViewState(){
    $('.collapsible_megamenu').each(function(){
      var naviCollapseWidth = $(this).is('[data-collapse-width]') ? $(this).data('collapse-width') : 0;
      
      if ($(window).width() > naviCollapseWidth){
        $(this).removeClass('collapsed')
        $(this).addClass('megamenu')
      }
      else {
        $(this).removeClass('megamenu')
        $(this).addClass('collapsed')
      }
      
    })
  }

  function clearSelection(menulist) {
    menulist.removeClass('selected')
    menulist.removeClass('selected-parent')
    menulist.removeClass('selected-ancestor')

    menulist.find("li.selected").each(function () {
      $(this).removeClass('selected')
    })
    menulist.find("li.selected-parent").each(function () {
      $(this).removeClass('selected-parent')
    })
    menulist.find("li.selected-ancestor").each(function () {
      $(this).removeClass('selected-ancestor')
    })
  }

  function setNewSelection(newSelection) {
    newSelection.addClass('selected')
    if (newSelection.hasClass('menu-list'))
      return

    //set selected-parent
    var parent = newSelection.closest('li:not(".selected")')
    parent.addClass('selected-parent')
    if (parent.hasClass('menu-list'))
      return

    //set selected-ancestor
    var ancestor = parent.closest('li:not(".selected-parent")')
    ancestor.addClass('selected-ancestor')
    if (ancestor.hasClass('menu-list'))
      return
    setSelectedAncestor(ancestor)
  }

  function setSelectedAncestor(li) {
    var ancestor = li.closest('li:not(".selected-ancestor")')
    if (ancestor.prop('tagName') != "LI")
      return
    ancestor.addClass('selected-ancestor')
    if (ancestor.hasClass('menu-list'))
      return
    setSelectedAncestor(ancestor)
  }

  function animateMenuList(action, menulist, navi){
    var show = true
    var hide = false
    var animationStartCount = 100
    var animationEndCount = 0
    if (action == 'hide'){
      show = false
      hide = true
      animationStartCount = 0
      animationEndCount = 100
    }
    
    //clone menulist then hide and mark cloned menulist
    var fakemenu = menulist.clone()
    fakemenu.css("transform", "translateY(100vh)")
    fakemenu.addClass('for-animation')

    //set animation counter
    fakemenu.css("grid-gap", animationStartCount)  //for animate counter only (not really used)

    //set fakemenu settings to show
    if (show) fakemenu.addClass('selected')

    if (hide) clearSelection(menulist)

    //add fakemenu to DOM
    navi.append(fakemenu)

    if (show){
      //set fakemenu settings to show
      fakemenu.addClass('selected')
    }

    //do animation
    fakemenu.animate(
        {gridGap: animationEndCount},
        {
          step: function (now, fx) {
            $(this).css("transform", "translateY(" + now + "vh)")
          },
          easing: 'linear',
          duration: animation_speed,
          complete: function () {
            fakemenu.remove()
            if (show) menulist.addClass('selected')
          }
        }
    )
  }

  function showNextMenu(menulist, navi, newSelection, goForward) {
    //clone and replace navibar
    var fakecurmenu = menulist.clone()
    fakecurmenu.addClass('for-animation')
    fakecurmenu.addClass('fakecurmenu')
    fakecurmenu.css("z-index", 9999999999999)
    fakecurmenu.css('width', '100%')
    navi.append(fakecurmenu)

    //do selection change
    clearSelection(menulist)
    setNewSelection(newSelection)

    //clone new menu
    var fakenewmenu = menulist.clone()
    fakenewmenu.addClass('for-animation')
    fakenewmenu.addClass('fakenewmenu')
//    fakenewmenu.css('position', 'absolute')
//    fakenewmenu.css('top', 0)
//    fakenewmenu.css('width', '100%')
    if (goForward) {
      fakenewmenu.css('left', '100%')
    }
    else {
      fakenewmenu.css('left', '-100%')
    }
    navi.append(fakenewmenu)

    //hide menulist
    menulist.addClass('animating')

    fakecurmenu.css("grid-gap", 0)  //for animate counter only (not really used)
    fakecurmenu.animate(
        {"grid-gap": 100},
        {
          step: function (now, fx) {
            if (goForward) {
              fakecurmenu.css("transform", "translateX(-" + now + "vw)")
              fakenewmenu.css("left", (100 - now) + "%")
            }
            else {
              fakecurmenu.css("transform", "translateX(" + now + "vw)")
              fakenewmenu.css("left", (-100 + now) + "%")
            }
          },
          easing: 'linear',
          duration: animation_speed,
          complete: function () {
            fakecurmenu.remove()
            fakenewmenu.remove()
            menulist.removeClass('animating')
          }
        }
    )
  }

  function isMenuDisplayed(menulist){
    var retval = false
    if (menulist.hasClass("selected") || menulist.hasClass("selected-parent") || menulist.hasClass("selected-ancestor")) {
      retval = true
    }
    return retval
  }

})