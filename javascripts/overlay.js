var EBS_URL = 'tooltips.layerth.dev';
var testing = false;

// EBS_URL = "localhost:3033";
// testing = true

const ASSETS = {
  hero_miniicon: function (filename) {
    return `https://dotatooltips.b-cdn.net/hero_miniicons/${filename}_png.png`;
  },
  hero_icon: function (filename) {
    return `https://dotatooltips.b-cdn.net/hero_icons/${filename}_png.png`;
  },
  hero_video: function (filename) {
    return `https://dotatooltips.b-cdn.net/hero_videos/${filename}.webm`;
  },
  spellicon: function (filename) {
    return `https://dotatooltips.b-cdn.net/spellicons/${filename}_png.png`;
  },
  itemicon: function (filename) {
    return `https://dotatooltips.b-cdn.net/items/${filename.replace(
      'item_',
      ''
    )}_png.png`;
  },
  faceticon: function (filename) {
    return `https://dotatooltips.b-cdn.net/facet_icons/${filename}_png.png`;
  },
  ability_video: function (hero_name, ability_name, filetype) {
    return `https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/abilities/${hero_name.replace(
      'npc_dota_hero_',
      ''
    )}/${ability_name}.${filetype}`;
  },
  attribute_icon: {
    DOTA_ATTRIBUTE_AGILITY: './images/dota/hero_agility.png',
    DOTA_ATTRIBUTE_STRENGTH: './images/dota/hero_strength.png',
    DOTA_ATTRIBUTE_INTELLECT: './images/dota/hero_intelligence.png',
  },
};

let EXTENSION_SETTINGS_URL =
  'https://dotatooltips.b-cdn.net/extension_settings/dota2tooltips.json';

let DOTA_HEROES_URL = '';
let DOTA_ITEMS_URL = '';
let DOTA_PATCHNOTES_URL = '';
let DOTA_STRINGS = '';

function SetLanguageForDataURLs(lang) {
  DOTA_HEROES_URL =
    'https://dotatooltips.b-cdn.net/data/' + lang + '/full-heroes.json';
  DOTA_ITEMS_URL =
    'https://dotatooltips.b-cdn.net/data/' + lang + '/full-items.json';
  DOTA_PATCHNOTES_URL =
    'https://dotatooltips.b-cdn.net/data/' + lang + '/patchnotes.json';
  DOTA_STRINGS =
    'https://dotatooltips.b-cdn.net/data/' + lang + '/dota_strings.json';
}

// Language stuff
let local_language = 'english';
// default english
SetLanguageForDataURLs(local_language);

function SetLanguage(lang) {
  // console.log("Setting language to", lang);
  $('#extension_setting_language').val(lang);
  local_language = lang;

  // Fetch everything for the new language
  SetLanguageForDataURLs(lang);
  FetchAllData();
}

let DOTA_SHOP_URL = 'https://dotatooltips.b-cdn.net/data/shops.json';

var local_item_shop = {};

function GetItemShopData() {
  $.ajax({
    type: 'GET',
    cache: false,
    url: DOTA_SHOP_URL,
    success: function (body) {
      local_item_shop = body;
      // console.log(local_item_shop);
    },
    error: function () {
      console.log('Failed to get item_shop.');
    },
  });
}

// let DOTA_ITEMS_URL = 'https://dotatooltips.b-cdn.net/data/full-items.json';
// let DOTA_HEROES_URL = 'https://dotatooltips.b-cdn.net/data/full-heroes.json';
// let DOTA_PATCHNOTES_URL = 'https://dotatooltips.b-cdn.net/data/patchnotes_english.json';
// if (testing) {
// 	DOTA_ITEMS_URL = 'https://dotatooltips.b-cdn.net/data/testing/full-items.json';
// 	DOTA_HEROES_URL = 'https://dotatooltips.b-cdn.net/data/testing/full-heroes.json';
// 	DOTA_PATCHNOTES_URL = 'https://dotatooltips.b-cdn.net/data/testing/patchnotes_english.json';
// }

const STRINGS = {
  'DOTA_ABILITY_BEHAVIOR_UNIT_TARGET | DOTA_ABILITY_BEHAVIOR_POINT':
    'Unit or Point Target',
  DOTA_ABILITY_BEHAVIOR_AUTOCAST: 'Auto-cast',
  DOTA_ABILITY_BEHAVIOR_IGNORE_BACKSWING: '',
  DOTA_ABILITY_BEHAVIOR_ROOT_DISABLES: '',
  DOTA_ABILITY_BEHAVIOR_NO_TARGET: 'No Target',
  DOTA_ABILITY_BEHAVIOR_PASSIVE: 'Passive',
  DOTA_ABILITY_BEHAVIOR_TOGGLE: 'Toggle',
  DOTA_ABILITY_BEHAVIOR_UNIT_TARGET: 'Unit Target',
  DOTA_ABILITY_BEHAVIOR_POINT: 'Point Target',
  DOTA_ABILITY_BEHAVIOR_AOE: '(AOE)',
  DOTA_ABILITY_BEHAVIOR_CHANNELLED: 'Channeled',
  DOTA_ABILITY_BEHAVIOR_DONT_RESUME_ATTACK: '',
  DOTA_ABILITY_BEHAVIOR_IMMEDIATE: '',
  DOTA_UNIT_TARGET_TEAM_ENEMY: 'Enemy',
  DOTA_UNIT_TARGET_TEAM_FRIENDLY: 'Allies',
  DOTA_UNIT_TARGET_TEAM_CUSTOM: '',
  DOTA_UNIT_TARGET_CUSTOM: '',
  DAMAGE_TYPE_MAGICAL: 'Magical',
  DAMAGE_TYPE_PURE: 'Pure',
  DAMAGE_TYPE_PHYSICAL: 'Physical',
  SPELL_IMMUNITY_ENEMIES_YES: 'Yes',
  SPELL_IMMUNITY_ALLIES_YES: 'Yes',
  SPELL_IMMUNITY_ENEMIES_NO: 'No',
  SPELL_DISPELLABLE_YES_STRONG: 'Strong Dispels Only',
  SPELL_DISPELLABLE_YES: 'Yes',
  SPELL_DISPELLABLE_NO: 'Cannot be dispelled',
};

function StringTooltip(word) {
  var word_list = word.split(' | ');
  var mod_word_list = [];
  var mod_word_string = '';

  for (var i = 0; i < word_list.length; i++) {
    if (STRINGS[word_list[i]]) {
      mod_word_string += STRINGS[word_list[i]];
      mod_word_list.push(STRINGS[word_list[i]]);
    }
  }

  return mod_word_list.join(' - ');
}

function stripHTML(dirtyString) {
  var container = document.createElement('div');
  var text = document.createTextNode(dirtyString);
  container.appendChild(text);
  return container.innerHTML;
}

function ReplaceNewLines(target) {
  // !! Safely replace \n with <br \> tags !!
  target.html(stripHTML(target.text()).replace(/\\n/g, '<br >'));
}

function ReplaceSeperators(target) {
  // !! Safled replace | with <span>/</span> !!
  target.html(stripHTML(target.text()).replace(/\|/g, '<span>/</span>'));
}

function TooltipArrayToString(values) {
  values += '';

  if (values.indexOf(',') > -1) {
    values = values.split(',');
  } else if (!Array.isArray(values)) {
    values = values.split(' ');
  }

  // Remove trailing 0
  for (var i = 0; i < values.length; i++) {
    var value = values[i];
    if (value.split('.')[1] === '0') {
      values[i] = value.split('.')[0];
    }
  }

  return values.join(' | ');
}

$(function () {
  // console.log("Loaded!");

  $('.content').click(function (event) {
    if (event.target.id == 'main_box') {
      ClearHeroCard();

      $('.settings_container').removeClass('open');
    }

    let e_target = $(event.target);
    if (
      !e_target.closest('.ability').length &&
      !e_target.closest('.ability_video_preview_container').length &&
      !e_target.closest('.ability_box').length
    ) {
      $('.ability_video_preview_container').removeClass('open');
    }
  });

  var mouse_timeout = null;
  $('.content').on('mousemove', function () {
    clearTimeout(mouse_timeout);
    $('.content').addClass('hovering');
    mouse_timeout = setTimeout(function () {
      $('.content').removeClass('hovering');
    }, 3000);
  });

  $('.content').hover(
    function () {
      $(this).addClass('hovering');
    },
    function () {
      $(this).removeClass('hovering');
    }
  );

  // Ability Tooltips hero card
  $('.content').on('mouseenter', '.ability_box>img', function () {
    var ability_name = $(this).attr('data-ability-name');
    var hero_name = $(this).attr('data-hero-name');

    var ability;
    if (local_heroes[hero_name]) {
      for (var i = 0; i < local_heroes[hero_name]['abilities'].length; i++) {
        if (local_heroes[hero_name]['abilities'][i]['n'] == ability_name) {
          ability = local_heroes[hero_name]['abilities'][i];
        }
      }
    }

    if (ability) {
      SetAbilityTooltip(ability, $(this), hero_name, true);
      $('.tooltip').addClass('open');
    }
  });

  $('.content').on('mouseleave', '.ability_box>img', function () {
    $('.tooltip').removeClass('open');
  });

  // Bottomhud Ability Tooltips
  $('.content').on('mouseenter', '.bottom_hud .ability', function () {
    $('.content').removeClass('highlight_spells');

    var ability_name = $(this).attr('data-ability-name');
    var hero_name = $(this).attr('data-hero-name');

    var ability;
    if (local_heroes[hero_name]) {
      for (var i = 0; i < local_heroes[hero_name]['abilities'].length; i++) {
        if (local_heroes[hero_name]['abilities'][i]['n'] == ability_name) {
          ability = local_heroes[hero_name]['abilities'][i];
        }
      }
    }

    if (ability) {
      SetAbilityTooltip(ability, $(this), hero_name, true);
      $('.tooltip').addClass('open');
    }
  });

  $('.content').on('mouseleave', '.bottom_hud .ability', function () {
    $('.tooltip').removeClass('open');
  });

  // Talent Tooltips
  $('.content').on('mouseenter', '.talents', function () {
    var hero_name = $(this).attr('data-hero-name');

    let ogre_learning_curve = false;
    // console.log($(this).attr('data-ogre-learning-curve'));
    if ($(this).attr('data-ogre-learning-curve') == '1') {
      ogre_learning_curve = true;
    }

    if (local_heroes[hero_name]) {
      SetTalentTooltip(local_heroes[hero_name], $(this), ogre_learning_curve);
      $('.talent_tooltip').addClass('open');
    }
  });

  $('.content').on('mouseleave', '.talents', function () {
    $('.talent_tooltip').removeClass('open');
  });

  // Aghs Tooltips
  $('.content').on('mouseenter', '.aghs', function () {
    var hero_name = $(this).attr('data-hero-name');

    if (local_heroes[hero_name]) {
      SetAghsTooltip(local_heroes[hero_name], $(this));
      $('.aghs_tooltip').addClass('open');
    }
  });

  $('.content').on('mouseleave', '.aghs', function () {
    $('.aghs_tooltip').removeClass('open');
  });

  // Item Tooltips
  $('.content').on('mouseenter', '.items>.item_frame', function () {
    var item_name = $(this).attr('data-item');
    if (local_items && local_items[item_name]) {
      $(this).addClass('active');
      SetItemTooltip(local_items[item_name], $(this));
      $('.item_tooltip').addClass('open');
    }
  });

  $('.content').on('mouseleave', '.items>.item_frame', function () {
    $(this).removeClass('active');
    $('.item_tooltip').removeClass('open');
  });

  // Item Tooltips Hero card
  $('.content').on('mouseenter', '.hero_card_items .item_icon', function () {
    var item_name = $(this).attr('data-item-name');
    if (local_items && local_items[item_name]) {
      $(this).addClass('active');
      SetItemTooltip(local_items[item_name], $(this));
      $('.item_tooltip').addClass('open');
    }
  });

  $('.content').on('mouseleave', '.hero_card_items .item_icon', function () {
    $(this).removeClass('active');
    $('.item_tooltip').removeClass('open');
  });

  // Facets Tooltips
  $('.content').on('mouseenter', '.facet_and_innate_hitbox', function () {
    let hero_class = $(this).attr('data-hero-name');
    let selected_facet = $(this).attr('data-selected-facet');
    if (local_heroes && local_heroes[hero_class]) {
      $(this).addClass('active');
      SetFacetsAndInateTooltip(
        local_heroes[hero_class],
        $(this),
        selected_facet
      );
      $('.facets_and_inate_tooltip').addClass('open');
    }
  });

  $('.content').on('mouseleave', '.facet_and_innate_hitbox', function () {
    $(this).removeClass('active');
    $('.facets_and_inate_tooltip').removeClass('open');
  });

  // Listen for incoming broadcast message from our EBS and do ajax request for the data
  // Data is not received via PubSub due to the message size limit
  twitch.listen('broadcast', function (target, contentType, data) {
    // console.log("UPDATE PUB SUB!");
    data = JSON.parse(data);

    let delay = 0;
    if (broadcast_delay) {
      delay = broadcast_delay * 1000;
    }

    setTimeout(function () {
      ReceivedPubSubData(data);
    }, delay);
  });

  $('.top_hud_hero').click(function () {
    var hero_index = $(this).attr('data-hero-index');

    if (
      top_hud_heroes[hero_index] &&
      local_heroes[top_hud_heroes[hero_index]]
    ) {
      SetHeroCard(
        local_heroes[top_hud_heroes[hero_index]],
        hero_index,
        $(this)
      );
    }
  });

  $('.close_hero_card').click(function () {
    ClearHeroCard();
  });

  $('.bottom_hud').on('click', '.ability', function () {
    var ability_name = $(this).attr('data-ability-name');
    var hero_name = $(this).attr('data-hero-name');

    var ability;
    if (local_heroes[hero_name]) {
      for (var i = 0; i < local_heroes[hero_name]['abilities'].length; i++) {
        if (local_heroes[hero_name]['abilities'][i]['n'] == ability_name) {
          ability = local_heroes[hero_name]['abilities'][i];
        }
      }
    }

    if (ability) {
      PlayAbilityVideo(ability, hero_name);
    }
  });

  $('.hero_card').on('click', '.ability_box>img', function () {
    var ability_name = $(this).attr('data-ability-name');
    var hero_name = $(this).attr('data-hero-name');

    var ability;
    if (local_heroes[hero_name]) {
      for (var i = 0; i < local_heroes[hero_name]['abilities'].length; i++) {
        if (local_heroes[hero_name]['abilities'][i]['n'] == ability_name) {
          ability = local_heroes[hero_name]['abilities'][i];
        }
      }
    }

    if (ability) {
      PlayAbilityVideo(ability, hero_name);
    }
  });

  $('.ability_video_close').click(function () {
    $('.ability_video_preview_container').removeClass('open');
  });

  $('.menu_box_settings').click(function () {
    $('.settings_container').addClass('open');
  });

  $('.settings_container_close').click(function () {
    $('.settings_container').removeClass('open');
  });

  // Extension settings

  $('.setting_toggle').click(function () {
    $(this).toggleClass('toggle_selected');
    if (token && opaqueId) {
      SaveViewerSettings(opaqueId);
    }
  });

  $('#extension_setting_language').on('change', function () {
    SetLanguage(this.value);
    if (token && opaqueId) {
      SaveViewerSettings(opaqueId);
    }
  });

  function SaveViewerSettings(opaqueId) {
    let data = {
      opaque_id: opaqueId,
      extension_setting_language: $('#extension_setting_language').val(),
      extension_setting_inital_prompt: $(
        '#extension_setting_inital_prompt'
      ).hasClass('toggle_selected'),
    };

    $.ajax({
      type: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
      },
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: JSON.stringify(data),
      url: location.protocol + '//' + EBS_URL + '/viewer/' + opaqueId,
      success: function (data) {
        console.log('Saved viewer settings', data);
      },
      error: function (err) {
        console.log(err);
      },
    });
  }

  DoResize();
  setTimeout(function () {
    DoResize();
  }, 100);

  // Get all files
  FetchAllData();

  if (testing) {
    // GetFullData(1, "39754760")

    // https://static-cdn.jtvnw.net/previews-ttv/live_user_bukka_-1920x1080.jpg
    // $('.content').append('<img src="./images/screenshot_4.png" class="screenshot" />')
    // $('.content').append('<img src="./images/screenshot_5.png" class="screenshot" />')
    // $('.content').append('<img src="./images/screenshot_6.png" class="screenshot" />')

    // get URL param for &screenshot and use that as the screenshot

    let urlParams = new URLSearchParams(window.location.search);
    let screenshot = urlParams.get('screenshot');
    // console.log("SCREENSHOT", screenshot);
    if (screenshot) {
      $('.content').append(
        `<img src="./images/${screenshot}.png" class="screenshot" />`
      );
    }

    // $('.content').append('<img src="./images/screenshot_demo.png" class="screenshot" />')

    // GetPubSubData("39754760")
    setInterval(function () {
      // GetPubSubData("39754760")
    }, 500);

    channel = 'bukka_';
    channel_id = '39754760';

    opaqueId = 'UrYSKMQ26AkJOEb1M0QuH';
    GetViewerSettings(opaqueId);
  }
});

function FetchAllData() {
  // Check if we should break cache
  GetExtensionSettings(function (settings) {
    if (settings && !testing) {
      GetItemData(settings['cache_slug'], true);
      GetHeroData(settings['cache_slug'], true);
      GetPatchNotesData(settings['cache_slug'], true);
      GetDotaStrings(settings['cache_slug'], true);
      GetItemShopData();
    } else {
      // Get uncached
      GetItemData('', false);
      GetHeroData('', false);
      GetPatchNotesData('', false);
      GetDotaStrings('', false);
      GetItemShopData();
    }

    if (settings && settings['extension_status']) {
      setExtensionStatus(settings['extension_status']);
    }
  });
}

function setExtensionStatus(status) {
  let status_e = $('.extension_status_container');

  status_e.attr('class', `extension_status_container ${status.color}`);
  status_e.addClass('loaded');

  status_e.find('.extension_status_short_text').text(status.short);
  status_e.find('.extension_status_text').text(status.text);
  status_e.find('.extension_status_text_date').text(status.date);
}

function GetExtensionSettings(callback) {
  $.ajax({
    type: 'GET',
    cache: false,
    url: EXTENSION_SETTINGS_URL,
    success: function (body) {
      return callback(body);
    },
    error: function () {
      return callback(false);
    },
  });
}

var local_strings = {};
function GetDotaStrings(slug, is_cached) {
  $.ajax({
    type: 'GET',
    cache: is_cached,
    url: DOTA_STRINGS + slug,
    success: function (body) {
      local_strings = body;
      ReplaceLocStrings();
    },
    error: function () {
      console.log('Failed to get dota_strings.');
    },
  });
}

function ReplaceLocStrings() {
  $('*[data-loc-string]').each(function (index, el) {
    let loc_string = $(this).attr('data-loc-string');
    if (loc_string && GetLocalString(loc_string)) {
      let final_string = GetLocalString(loc_string);
      $(this).text(final_string);
    }
  });
}

function GetLocalString(n) {
  let n_clean = n.replace('#', '');
  if (local_strings[n_clean]) {
    return local_strings[n_clean];
  } else {
    return false;
  }
}

var local_items = {};
function GetItemData(slug, is_cached) {
  $.ajax({
    type: 'GET',
    cache: is_cached,
    url: DOTA_ITEMS_URL + slug,
    success: function (body) {
      local_items = body;
    },
    error: function () {
      console.log('Failed to get dota_items.');
    },
  });
}

var first_pub_sub = false;
var local_heroes = {};
function GetHeroData(slug, is_cached) {
  $.ajax({
    type: 'GET',
    cache: is_cached,
    url: DOTA_HEROES_URL + slug,
    success: function (body) {
      local_heroes = body;
      if (channel_id && !first_pub_sub) {
        first_pub_sub = true;
        GetPubSubData(channel_id);
      }
    },
    error: function () {
      console.log('Failed to get dota_heroes.');
    },
  });
}

var local_patchnotes = {};
function GetPatchNotesData(slug, is_cached) {
  $.ajax({
    type: 'GET',
    cache: is_cached,
    url: DOTA_PATCHNOTES_URL + slug,
    success: function (body) {
      local_patchnotes = body;
    },
    error: function () {
      console.log('Failed to get dota_patchnotes.');
    },
  });
}

// PATCH NOTES

function GetPatchNotes(string) {
  // console.log("patchnoes for", string);
  var patchnotes_e = $('<div class="patchnotes"></div>');

  if (local_patchnotes && local_patchnotes['active_patch']) {
    Object.keys(local_patchnotes['active_patch']).forEach(function (patch) {
      var lines = [];

      function GetPatchLine(i) {
        let line_index = '';
        if (i > 0) {
          line_index = '_' + (parseInt(i) + 1);
        }
        let line =
          local_patchnotes['data'][
            `DOTA_Patch_${patch}_${string}${line_index}`
          ];
        if (line) {
          lines.push(line);
          var line_e = $(
            '<div class="patch_line"><div class="patch_version"></div><div class="patch_line_text"></div></div>'
          );
          line_e
            .find('.patch_version')
            .text(local_patchnotes['active_patch'][patch]);
          line_e.find('.patch_line_text').text(line);
          patchnotes_e.append(line_e);

          GetPatchLine(i + 1);
        }
      }
      GetPatchLine(0);
    });
  }

  return patchnotes_e;
}

// ---------------
// AGHS TOOLTIPS
// ---------------

function GetAghsUpgrades(hero) {
  var abilities_to_return = [];

  for (var i = 0; i < hero['abilities'].length; i++) {
    var ability = hero['abilities'][i];
    let ability_to_add = {};

    if (ability['IsGrantedByScepter']) {
      ability_to_add['granted'] = ability;
    }

    if (ability['HasScepterUpgrade']) {
      ability_to_add['upgraded'] = ability;
    }
    if (ability_to_add['upgraded'] || ability_to_add['granted']) {
      abilities_to_return.push(ability_to_add);
    }
  }

  if (abilities_to_return.length > 0) {
    return abilities_to_return;
  } else {
    return false;
  }
}

function GetShardUpgrades(hero) {
  var abilities_to_return = [];

  for (var i = 0; i < hero['abilities'].length; i++) {
    var ability = hero['abilities'][i];
    let ability_to_add = {};

    if (ability['IsGrantedByShard']) {
      ability_to_add['granted'] = ability;
    }

    if (ability['HasShardUpgrade']) {
      ability_to_add['upgraded'] = ability;
    }
    if (ability_to_add['upgraded'] || ability_to_add['granted']) {
      abilities_to_return.push(ability_to_add);
    }
  }

  if (abilities_to_return.length > 0) {
    return abilities_to_return;
  } else {
    return false;
  }
}

function GetAbilityByClass(ability_class) {
  if (!local_heroes) {
    console.log("No local_heroes can't get ability by class");
    return false;
  }

  for (var hero in local_heroes) {
    for (var i = 0; i < local_heroes[hero]['abilities'].length; i++) {
      var ability = local_heroes[hero]['abilities'][i];
      if (ability['n'] == ability_class) {
        return ability;
      }
    }
  }

  return false;
}

function CheckForBottomHUD(ability) {
  if (ability['ExcludeFromBottomHUD'] == '1') {
    return false;
  }
  return true;
}

function SetAghsTooltip(hero, target) {
  var position = target.offset();
  var scale_offset = $('.content').offset();

  var x_offset =
    (position.left - scale_offset.left) * (1 / ui_rescale) + target.width() / 2;
  var y_offset =
    (position.top - scale_offset.top) * (1 / ui_rescale) + target.height() / 2;

  $('.aghs_tooltip').css({
    top: y_offset + 56,
    left: x_offset - 5,
  });

  if (y_offset < 500) {
    $('.aghs_tooltip').addClass('tooltip_up');
    $('.aghs_tooltip').removeClass('tooltip_bottom');
  } else {
    $('.aghs_tooltip').removeClass('tooltip_up');
    $('.aghs_tooltip').addClass('tooltip_bottom');
  }

  RenderAghsTooltip(
    GetAghsUpgrades(hero),
    GetShardUpgrades(hero),
    $('.content .aghs_box')
  );
}

function appendAghsAbility(aghs, aghs_list) {
  let aghs_ability_e = $(`<div class="affected_ability_body">
		<div class="affected_ability_icon">
			<img src="" width="48px" height="48px" />
		</div>
		<div>
			<div class="affected_ability">
				<div class="affected_ability_title"></div>
				<div class="upgrade">UPGRADE</div>
			</div>
			<div class="affected_ability_desc">
			
			</div>
		</div>
	</div>`);

  if (aghs['granted']) {
    aghs_ability_e.addClass('new_ability');
    aghs_ability_e
      .find('.affected_ability_icon>img')
      .attr('src', ASSETS.spellicon(aghs['granted']['n']));

    aghs_ability_e
      .find('.affected_ability_title')
      .text(aghs['granted']['name']);
    aghs_ability_e
      .find('.affected_ability_desc')
      .text(aghs['granted']['tooltips']['Description']);
    ReplaceNewLines(aghs_ability_e.find('.affected_ability_desc'));

    aghs_ability_e.find('.upgrade').text('NEW ABILITY');
  } else if (aghs['upgraded']) {
    aghs_ability_e.removeClass('new_ability');

    aghs_ability_e
      .find('.affected_ability_icon>img')
      .attr('src', ASSETS.spellicon(aghs['upgraded']['n']));

    aghs_ability_e
      .find('.affected_ability_title')
      .text(aghs['upgraded']['name']);
    aghs_ability_e
      .find('.affected_ability_desc')
      .text(aghs['upgraded']['tooltips']['scepter_description']);
    ReplaceNewLines(aghs_ability_e.find('.affected_ability_desc'));

    aghs_ability_e.find('.upgrade').text('UPGRADE');
  } else {
    aghs_ability_e.removeClass('new_ability');
  }

  aghs_list.append(aghs_ability_e);
}

function appendShardAbility(shard, shard_list) {
  let shard_ability_e = $(`<div class="affected_ability_body">
		<div class="affected_ability_icon">
			<img src="" width="48px" height="48px" />	
		</div>
		<div>
			<div class="affected_ability">
				<div class="affected_ability_title"></div>
				<div class="upgrade">UPGRADE</div>
			</div>
			<div class="affected_ability_desc">
			
			</div>
		</div>
	</div>`);

  if (shard['granted']) {
    shard_ability_e.addClass('new_ability');
    shard_ability_e
      .find('.affected_ability_icon>img')
      .attr('src', ASSETS.spellicon(shard['granted']['n']));
    shard_ability_e
      .find('.affected_ability_title')
      .text(shard['granted']['name']);
    shard_ability_e
      .find('.affected_ability_desc')
      .text(shard['granted']['tooltips']['Description']);
    ReplaceNewLines(shard_ability_e.find('.affected_ability_desc'));
    shard_ability_e.find('.upgrade').text('NEW ABILITY');
  } else if (shard['upgraded']) {
    shard_ability_e.removeClass('new_ability');
    shard_ability_e
      .find('.affected_ability_icon>img')
      .attr('src', ASSETS.spellicon(shard['upgraded']['n']));
    shard_ability_e
      .find('.affected_ability_title')
      .text(shard['upgraded']['name']);
    shard_ability_e
      .find('.affected_ability_desc')
      .text(shard['upgraded']['tooltips']['shard_description']);
    ReplaceNewLines(shard_ability_e.find('.affected_ability_desc'));
    shard_ability_e.find('.upgrade').text('UPGRADE');
  } else {
    shard_ability_e.removeClass('new_ability');
  }

  shard_list.append(shard_ability_e);
}

function RenderAghsTooltip(aghs_abilities, shard_abilities, ab_e) {
  let aghs_e = ab_e.find('.aghs_upgrade');
  let shard_e = ab_e.find('.shard_upgrade');

  // console.log(aghs_abilities, shard_abilities);

  // SCEPTER
  aghs_e.find('.body').show();
  if (aghs_abilities.length > 0) {
    aghs_e.find('.body-none').hide();
    aghs_e.find('.body').show();

    aghs_e.find('.body').html('');
    aghs_abilities.forEach(function (aghs) {
      appendAghsAbility(aghs, aghs_e.find('.body'));
    });
  } else {
    aghs_e.find('.body').hide();
    aghs_e.find('.body-none').show();
  }

  // SHARD
  shard_e.find('.body').show();
  if (shard_abilities.length > 0) {
    shard_e.find('.body-none').hide();
    shard_e.find('.body').show();

    shard_e.find('.body').html('');
    shard_abilities.forEach(function (shard) {
      appendShardAbility(shard, shard_e.find('.body'));
    });
  } else {
    shard_e.find('.body').hide();
    shard_e.find('.body-none').show();
  }
}

// ---------------
// TALENT TOOLTIPS
// ---------------

function SetTalentTooltip(hero, target, ogre_learning_curve = false) {
  var position = target.offset();
  var scale_offset = $('.content').offset();

  var x_offset =
    (position.left - scale_offset.left) * (1 / ui_rescale) + target.width() / 2;
  var y_offset =
    (position.top - scale_offset.top) * (1 / ui_rescale) + target.height() / 2;

  $('.talent_tooltip').css({
    top: y_offset + 62,
    left: x_offset,
  });

  if (y_offset < 500) {
    $('.talent_tooltip .stairs').addClass('align_top');
    $('.talent_tooltip').removeClass('tooltip_bottom');
  } else {
    $('.talent_tooltip .stairs').removeClass('align_top');
    $('.talent_tooltip').addClass('tooltip_bottom');
  }

  TalentTooltip(
    hero['talents'],
    $('.talent_tooltip .talent_box'),
    ogre_learning_curve
  );

  if (
    local_selected_hero_data &&
    hero['n'] == local_selected_hero_data['name']
  ) {
    SetTalentSelection(
      $('.talent_tooltip .talent_box'),
      local_selected_hero_data
    );
  } else if (local_hero_data && local_hero_data[hero['n']]) {
    SetTalentSelection(
      $('.talent_tooltip .talent_box'),
      local_hero_data[hero['n']]
    );
  } else {
    $('.talent_tooltip .talent_box').find('.selected').removeClass('selected');
  }
}

function TalentTooltip(talents, tb_e, ogre_learning_curve = false) {
  if (ogre_learning_curve) {
    tb_e.addClass('ogre_learning_curve');
  } else {
    tb_e.removeClass('ogre_learning_curve');
  }
  Object.keys(talents).forEach(function (talent_index) {
    tb_e.find('.' + talent_index).text(talents[talent_index]['name']);
  });
}

// ---------------------
// 	ABILITY TOOLTIP
// ---------------------

function SetAbilityTooltip(ability, target, hero_name, ability_video_preview) {
  var position = target.offset();
  var scale_offset = $('.content').offset();

  var x_offset =
    (position.left - scale_offset.left) * (1 / ui_rescale) + target.width() / 2;
  var y_offset =
    (position.top - scale_offset.top) * (1 / ui_rescale) + target.height() / 2;

  $('.tooltip').css({
    top: y_offset + 62,
    left: x_offset,
  });

  if (y_offset < 500) {
    $('.ability_tooltip').addClass('tooltip_up');
    $('.ability_tooltip').removeClass('tooltip_bottom');
  } else {
    $('.ability_tooltip').removeClass('tooltip_up');
    $('.ability_tooltip').addClass('tooltip_bottom');
  }

  $('.ability_tooltip .tooltip_content').html('');
  $('.ability_tooltip .tooltip_content').append(
    AbilityTooltip(ability, hero_name)
  );

  if (ability_video_preview) {
    let click_to_play_e = $(
      '<div class="ability_click_to_preview"><img src="./images/dota/icon_play_video_small.png" /> Click to preview video</div>'
    );
    $('.ability_tooltip .tooltip_content .ability_tooltip_box').append(
      click_to_play_e
    );
  }
}

function AbilityTooltip(ability, hero_name, innate_layout = false) {
  // console.log(ability);

  var tt_e = $(
    '<div class="ability_tooltip_box"><div class="ability_heading"></div></div>'
  );

  if (innate_layout) {
    // append spellicon
    tt_e.addClass('innate_layout');
    tt_e
      .find('.ability_heading')
      .append(
        '<img class="ability_icon" src="' +
          ASSETS.spellicon(ability['n']) +
          '">'
      );
  }

  tt_e.find('.ability_heading').append('<div class="AbilityTitle"></div>');
  tt_e.find('.AbilityTitle').text(ability.name);

  if (ability['Innate'] == '1') {
    tt_e
      .find('.AbilityTitle')
      .append('<div class="AbilityIsInnate">INNATE ABILITY</div>');
  }

  tt_e.append(`<div class="ability_details"></div>`);

  if (
    ability.AbilityBehavior &&
    StringTooltip(ability.AbilityBehavior) &&
    !innate_layout
  ) {
    tt_e
      .find('.ability_details')
      .append(
        '<div><div>ABILITY:</div> <div class="AbilityBehavior"></div></div>'
      );
    tt_e
      .find('.ability_details .AbilityBehavior')
      .text(StringTooltip(ability.AbilityBehavior));
  }

  if (
    ability.AbilityUnitTargetTeam &&
    StringTooltip(ability.AbilityUnitTargetTeam) &&
    !innate_layout
  ) {
    tt_e
      .find('.ability_details')
      .append(
        '<div><div>AFFECTS:</div> <div class="AbilityUnitTargetTeam"></div></div>'
      );
    tt_e
      .find('.ability_details .AbilityUnitTargetTeam')
      .text(StringTooltip(ability.AbilityUnitTargetTeam));
  }

  if (
    ability.AbilityUnitDamageType &&
    StringTooltip(ability.AbilityUnitDamageType) &&
    !innate_layout
  ) {
    tt_e
      .find('.ability_details')
      .append(
        '<div><div>DAMAGE TYPE:</div> <div class="AbilityUnitDamageType"></div></div>'
      );
    tt_e
      .find('.ability_details .AbilityUnitDamageType')
      .addClass(ability.AbilityUnitDamageType);
    tt_e
      .find('.ability_details .AbilityUnitDamageType')
      .text(StringTooltip(ability.AbilityUnitDamageType));
  }

  if (ability.SpellImmunityType && !innate_layout) {
    tt_e
      .find('.ability_details')
      .append(
        '<div><div>PIERCES SPELL IMMUNITY:</div> <div class="SpellImmunityType"></div></div>'
      );
    tt_e
      .find('.ability_details .SpellImmunityType')
      .addClass(ability.SpellImmunityType);
    tt_e
      .find('.ability_details .SpellImmunityType')
      .text(StringTooltip(ability.SpellImmunityType));
  }

  if (ability.SpellDispellableType && !innate_layout) {
    tt_e
      .find('.ability_details')
      .append(
        '<div><div>DISPELLABLE:</div> <div class="SpellDispellableType"></div></div>'
      );
    tt_e
      .find('.ability_details .SpellDispellableType')
      .addClass(ability.SpellDispellableType);
    tt_e
      .find('.ability_details .SpellDispellableType')
      .text(StringTooltip(ability.SpellDispellableType));
  }

  tt_e.append(
    '<div class="ability_desc"><div class="AbilityDescription"></div></div>'
  );

  if (ability.tooltips.Description) {
    tt_e.find('.AbilityDescription').text(ability.tooltips.Description);
    ReplaceNewLines(tt_e.find('.AbilityDescription'));
  }

  tt_e.append('<div class="ability_stats"></div>');

  for (var i = 0; i < ability.properties.length; i++) {
    var prop = ability.properties[i];
    var prop_e = $(
      '<div><div class="prop_name"></div><div class="prop_value"></div></div>'
    );
    prop_e.find('.prop_name').text(prop.name);

    prop_e.find('.prop_value').text(TooltipArrayToString(prop.value));
    ReplaceSeperators(prop_e.find('.prop_value'));

    tt_e.find('.ability_stats').append(prop_e);
  }

  if (
    ability.AbilityCooldown ||
    ability.AbilityManaCost ||
    ability.AbilityCastRange
  ) {
    tt_e.append('<div class="ability_cd_and_mana"></div>');
  }

  if (ability.AbilityCooldown) {
    tt_e
      .find('.ability_cd_and_mana')
      .append(
        '<div class="ability_cd"><img src="./images/dota/cd.png"><div class="ability_cd_value"></div></div>'
      );
    tt_e
      .find('.ability_cd_value')
      .text(TooltipArrayToString(ability.AbilityCooldown));

    ReplaceSeperators(tt_e.find('.ability_cd_value'));
  }

  if (ability.AbilityManaCost) {
    tt_e
      .find('.ability_cd_and_mana')
      .append(
        '<div class="ability_mana"><img src="./images/dota/mana.png"><div class="ability_mana_value"></div></div>'
      );
    tt_e
      .find('.ability_mana_value')
      .text(TooltipArrayToString(ability.AbilityManaCost));

    ReplaceSeperators(tt_e.find('.ability_mana_value'));
  }

  // Radius
  if (ability.AbilityCastRange) {
    tt_e
      .find('.ability_cd_and_mana')
      .append(
        '<div class="ability_range"><img src="./images/dota/ability_castrange_icon.png"><div class="ability_range_value"></div></div>'
      );
    tt_e
      .find('.ability_range_value')
      .text(TooltipArrayToString(ability.AbilityCastRange));
    ReplaceSeperators(tt_e.find('.ability_range_value'));
  }

  if (local_patchnotes && !innate_layout) {
    let patchnoes_e = GetPatchNotes(
      hero_name.replace('npc_dota_hero_', '') + '_' + ability['n']
    );

    if (patchnoes_e.children().length > 0) {
      tt_e.append(patchnoes_e);
    }

    // tt_e.append(GetPatchNotes(hero_name.replace('npc_dota_hero_', '')+'_'+ability['n']))
  }

  if (ability.tooltips.Lore && !innate_layout) {
    tt_e.append('<div class="AbilityLore"></div>');
    tt_e.find('.AbilityLore').text(ability.tooltips.Lore);
  }

  return tt_e;
}

// -------------------
// ITEM TOOLTIPS
// -------------------

function SetItemTooltip(item, target, shop = false) {
  $('.item_tooltip .tooltip_content').html('');
  $('.item_tooltip .tooltip_content').append(ItemTooltip(item));

  $('.item_tooltip').removeClass('tooltip_up');
  $('.item_tooltip').removeClass('tooltip_bottom');
  $('.item_tooltip').removeClass('tooltip_left');
  $('.item_tooltip').removeClass('tooltip_overflow');

  var position = target.offset();
  var scale_offset = $('.content').offset();

  if (shop) {
    var x_offset = (position.left - scale_offset.left) * (1 / ui_rescale) - 420;
    var y_offset = (position.top - scale_offset.top) * (1 / ui_rescale) - 100;

    $('.item_tooltip').css({
      top: y_offset,
      left: x_offset,
    });

    $('.item_tooltip').addClass('tooltip_left');

    if (y_offset + $('.item_tooltip').height() > 1080) {
      $('.item_tooltip').addClass('tooltip_overflow');
    }
  } else {
    $('.item_tooltip').removeClass('tooltip_left');
    var x_offset =
      (position.left - scale_offset.left) * (1 / ui_rescale) +
      target.width() / 2;
    var y_offset =
      (position.top - scale_offset.top) * (1 / ui_rescale) +
      target.height() / 2;

    $('.item_tooltip').css({
      top: y_offset + 62,
      left: x_offset,
    });

    if (y_offset < 500) {
      $('.item_tooltip').addClass('tooltip_up');
    } else {
      $('.item_tooltip').addClass('tooltip_bottom');
    }
  }
}

function ItemTooltip(item) {
  // console.log("ITEM", item);
  var tt_e = $('<div class="item_tooltip_box"></div>');

  tt_e.append('<div class="item_heading"></div>');

  tt_e
    .find('.item_heading')
    .append(
      '<div class="ItemIcon"><img src="" width="68px" height="48px" /></div><div class="ItemTitle"><div class="ItemName"></div><div class="ItemCost"><img src="./images/dota/icon_gold.png" width="26px" /><span></span></div></div>'
    );
  tt_e.find('.ItemName').text(item.name);
  tt_e.find('.ItemCost>span').text(parseInt(item.ItemCost).toLocaleString());

  tt_e.find('.ItemIcon>img').attr('src', ASSETS.itemicon(item.n));

  tt_e.append(`<div class="item_props"></div>`);

  for (var i = 0; i < item.properties.length; i++) {
    var prop = item.properties[i];

    var prop_e = $(
      '<div class="item_prop"><div class="prop_symbol"></div><div class="prop_value"></div><div class="prop_name"></div></div>'
    );

    prop_e.find('.prop_name').text(prop.name);
    let value_to_set = prop.value;
    if (prop.value >= 0) {
      prop_e.find('.prop_symbol').text('+');
    } else {
      prop_e.find('.prop_symbol').text('−');
      prop_e.addClass('negative');
      value_to_set = Math.abs(parseInt(value_to_set));
    }

    prop_e.find('.prop_value').text(value_to_set);
    tt_e.find('.item_props').append(prop_e);
  }

  function replaceTags(safe_string) {
    safe_string = safe_string.replace(/\[h1\]/g, '<h1>');
    safe_string = safe_string.replace(/\[\/h1\]/g, '</h1>');

    safe_string = safe_string.replace(/\[b\]/g, '<b>');
    safe_string = safe_string.replace(/\[\/b\]/g, '</b>');

    safe_string = safe_string.replace(/\\n/g, '<br >');
    return safe_string;
  }

  if (item.active) {
    tt_e.append('<div class="item_active"></div>');
    var safe_string = replaceTags(stripHTML(item.active));
    processed_string =
      safe_string.split('</h1>')[0] +
      '</h1><div>' +
      safe_string.split('</h1>')[1] +
      '</div>';
    tt_e.find('.item_active').html(processed_string);
  }

  if (item.passive) {
    tt_e.append('<div class="item_passive"></div>');
    var safe_string = replaceTags(stripHTML(item.passive));
    processed_string =
      safe_string.split('</h1>')[0] +
      '</h1><div>' +
      safe_string.split('</h1>')[1] +
      '</div>';
    tt_e.find('.item_passive').html(processed_string);
  }

  if (item.use) {
    tt_e.append('<div class="item_use"></div>');
    var safe_string = replaceTags(stripHTML(item.use));
    processed_string =
      safe_string.split('</h1>')[0] +
      '</h1><div>' +
      safe_string.split('</h1>')[1] +
      '</div>';
    tt_e.find('.item_use').html(processed_string);
  }

  if (item.upgrade) {
    tt_e.append('<div class="item_upgrade"></div>');
    var safe_string = replaceTags(stripHTML(item.upgrade));
    processed_string =
      safe_string.split('</h1>')[0] +
      '</h1><div>' +
      safe_string.split('</h1>')[1] +
      '</div>';
    tt_e.find('.item_upgrade').html(processed_string);
  }

  if (
    item.AbilityCooldown ||
    item.AbilityManaCost ||
    item.AbilityHealthCost ||
    item.AbilityCastRange
  ) {
    if (item.active) {
      tt_e
        .find('.item_active')
        .append('<span class="item_cd_and_mana"></span>');
    } else if (!item.active) {
      tt_e.find('.item_use').append('<span class="item_cd_and_mana"></span>');
    } else if (!item.use) {
      tt_e
        .find('.item_passive')
        .append('<span class="item_cd_and_mana"></span>');
    }
  }

  if (item.AbilityManaCost) {
    tt_e
      .find('.item_cd_and_mana')
      .append(
        '<div class="item_mana"><img src="./images/dota/mana.png"><div class="item_mana_value"></div></div>'
      );
    tt_e
      .find('.item_mana_value')
      .text(TooltipArrayToString(item.AbilityManaCost));

    ReplaceSeperators(tt_e.find('.item_mana_value'));
  }

  if (item.AbilityCooldown) {
    tt_e
      .find('.item_cd_and_mana')
      .append(
        '<div class="item_cd"><img src="./images/dota/cd.png" /><div class="item_cd_value"></div></div>'
      );
    tt_e
      .find('.item_cd_value')
      .text(TooltipArrayToString(item.AbilityCooldown));

    ReplaceSeperators(tt_e.find('.item_cd_value'));
  }

  if (item.AbilityHealthCost) {
    tt_e
      .find('.item_cd_and_mana')
      .append(
        '<div class="item_health_cost"><img src="./images/dota/ability_healthcost_icon.png" /><div class="item_health_value"></div></div>'
      );
    tt_e
      .find('.item_health_value')
      .text(TooltipArrayToString(item.AbilityHealthCost));
    ReplaceSeperators(tt_e.find('.item_health_value'));
  }

  if (item.AbilityCastRange) {
    tt_e
      .find('.item_cd_and_mana')
      .append(
        '<div class="item_range"><img src="./images/dota/ability_castrange_icon.png" /><div class="item_range_value"></div></div>'
      );
    tt_e
      .find('.item_range_value')
      .text(TooltipArrayToString(item.AbilityCastRange));
    ReplaceSeperators(tt_e.find('.item_range_value'));
  }

  if (local_patchnotes) {
    let patchnoes_e = GetPatchNotes(item['n']);
    if (patchnoes_e.children().length > 0) {
      tt_e.append(patchnoes_e);
    }
  }

  if (local_item_shop && local_item_shop['neutrals']) {
    Object.keys(local_item_shop['neutrals']).forEach(function (neutral_tier) {
      if (local_item_shop['neutrals'][neutral_tier]['items'].includes(item.n)) {
        tt_e
          .find('.ItemCost')
          .text(`Tier ${neutral_tier} Neutral Item`)
          .addClass('neutral_item');
      }
    });
  }

  if (item.tooltips.Lore) {
    tt_e.append('<div class="ItemLore"></div>');
    tt_e.find('.ItemLore').text(item.tooltips.Lore);
  }

  return tt_e;
}

// =================
//   FACET TOOLTIP
// =================

function SetFacetsAndInateTooltip(hero, target, selected_facet) {
  var position = target.offset();
  var scale_offset = $('.content').offset();

  var x_offset =
    (position.left - scale_offset.left) * (1 / ui_rescale) + target.width() / 2;
  var y_offset =
    (position.top - scale_offset.top) * (1 / ui_rescale) + target.height() / 2;

  $('.facets_and_inate_tooltip').css({
    top: y_offset + 56,
    left: x_offset,
  });

  if (y_offset < 500) {
    $('.talent_tooltip .stairs').addClass('align_top');
    $('.talent_tooltip').removeClass('tooltip_bottom');
  } else {
    $('.talent_tooltip .stairs').removeClass('align_top');
    $('.talent_tooltip').addClass('tooltip_bottom');
  }

  if (y_offset < 500) {
    $('.facets_and_inate_tooltip').addClass('tooltip_up');
    $('.facets_and_inate_tooltip').removeClass('tooltip_bottom');
  } else {
    $('.facets_and_inate_tooltip').removeClass('tooltip_up');
    $('.facets_and_inate_tooltip').addClass('tooltip_bottom');
  }

  let facets_and_innate = $('.facets_and_inate_tooltip .tooltip_content');
  facets_and_innate.html('');

  if (hero['facets']) {
    let facets = hero['facets'];
    facets_and_innate.append('<div class="main_tooltip"></div>');
    facets_and_innate.append('<div class="other_facets"></div>');
    Object.keys(facets).forEach(function (facet_index) {
      if (selected_facet == facet_index) {
        facets_and_innate
          .find('.main_tooltip')
          .append(FacetTooltip(facets[facet_index], facet_index));
      } else {
        facets_and_innate
          .find('.other_facets')
          .append(FacetTooltip(facets[facet_index], facet_index));
      }
    });
  }

  // get heroes innate ability
  let innate = hero['abilities'].find((ability) => ability['Innate'] == '1');
  if (innate) {
    facets_and_innate
      .find('.main_tooltip')
      .append(AbilityTooltip(innate, hero['n'], true));
  }
}

function FacetTooltip(facet, facet_index) {
  var tt_e = $('<div class="facet_tooltip_box"></div>');

  tt_e.attr('data-facet-index', facet_index);

  tt_e.append('<div class="facet_heading"></div>');
  tt_e
    .find('.facet_heading')
    .append(
      '<div class="FacetIcon"><img src="" /></div><div class="FacetTitle"></div><div class="facet_background"></div>'
    );

  const gradient_class = `${facet.Color.toLowerCase()}_${facet.GradientID}`;
  tt_e.find('.facet_background').addClass(gradient_class);

  tt_e.find('.FacetTitle').text(facet.tooltip.title);

  tt_e.find('.FacetIcon>img').attr('src', ASSETS.faceticon(facet.Icon));

  tt_e.append(
    '<div class="facet_desc"><div class="FacetDescription"></div></div>'
  );

  if (facet.tooltip.description) {
    tt_e.find('.FacetDescription').html(facet.tooltip.description);
    ReplaceNewLines(tt_e.find('.FacetDescription'));
  }

  // console.log(tt_e);

  return tt_e;
}

// ==================
//    HERO CARD
// ==================

var heroes_loaded_previously = {};

function ClearHeroCard() {
  $('.top_hud').removeClass('hero_card_active');
  $('.hero_card').css({
    top: '-266px',
  });
}

function CheckForHeroCard(ability) {
  if (ability['IsGrantedByScepter'] || ability['IsGrantedByShard']) {
    return false;
  }

  if (ability['ExcludeFromHeroCard'] == '1') {
    return false;
  }

  if (ability['ExcludeFromBottomHUD'] == '1') {
    return false;
  }

  return true;
}

function SetHeroCard(hero, index, target) {
  $('.user_prompt_to_click').removeClass('open');
  $('.top_hud').addClass('hero_card_active');

  var hc = $('.hero_card');

  const n = hero['n'];

  var position = target.offset();
  var scale_offset = $('.content').offset();

  var x_offset =
    (position.left - scale_offset.left) * (1 / ui_rescale) +
    (target.width() + 14) / 2;
  var y_offset = position.top - scale_offset.top / 2 + target.height() / 2;

  hc.css({
    top: y_offset + 48,
    left: x_offset,
  });

  hc.find('.hero_title>div').text(hero.Name);

  hc.find('.hero_title>img').attr('src', ASSETS.hero_miniicon(n));

  hc.find('.hero_video').addClass('loading_cover');
  hc.find('.hero_video video').attr('src', ASSETS.hero_video(n));

  hc.find('.hero_roles').text(hero.Short);

  hc.find('.abilities').html('');
  hc.find('.abilities').removeClass('ManyAbilities');

  let ability_count = 0;
  for (var i = 0; i < hero.abilities.length; i++) {
    var ability = hero.abilities[i];

    if (!CheckForHeroCard(ability)) {
      continue;
    }

    var ability_box_e = $(
      '<div class="ability_box loading_cover"><img src="" width="64px" height="64px" /></div>'
    );
    ability_box_e.find('img').attr('src', ASSETS.spellicon(ability['n']));
    // ability_box_e.find('img').attr('data-hero-index', index)
    ability_box_e.find('img').attr('data-hero-name', n);
    ability_box_e.find('img').attr('data-ability-name', ability['n']);
    hc.find('.abilities').append(ability_box_e);

    ability_count++;
    if (ability_count == 6) {
      hc.find('.abilities').addClass('ManyAbilities');
    }
  }

  hc.find('.facet_and_innate_hitbox').attr('data-hero-name', n);
  hc.find('.facet_and_innate_hitbox').attr('data-selected-facet', '0');
  hc.find('.talents').attr('data-hero-name', n);
  hc.find('.aghs').attr('data-hero-name', n);

  // function set Facet Icon and Color
  function SetFacetIconAndColor(hero_name, selected_facet) {
    // console.log(hero_name, selected_facet);
    if (
      local_heroes[hero_name]['facets'] &&
      local_heroes[hero_name]['facets'][selected_facet]
    ) {
      hc.find('.facet').attr('class', 'facet');
      hc.find('.facet_icon').html('');
      let facet = local_heroes[hero_name]['facets'][selected_facet];
      hc.find('.facet_icon').append(
        `<img src="${ASSETS.faceticon(facet.Icon)}" />`
      );
      hc.find('.facet').addClass(
        `${facet.Color.toLowerCase()}_${facet.GradientID}`
      );
      hc.find('.facet_and_innate_hitbox').attr(
        'data-selected-facet',
        selected_facet
      );

      if (hero_name == 'npc_dota_hero_ogre_magi' && selected_facet == '2') {
        hc.find('.talents').attr('data-ogre-learning-curve', '1');
      } else {
        hc.find('.talents').attr('data-ogre-learning-curve', '0');
      }
    }
  }

  // Facet
  if (local_hero_data && local_hero_data[n] && local_hero_data[n]['facet']) {
    SetFacetIconAndColor(n, local_hero_data[n]['facet']);
  } else {
    hc.find('.facet_icon').text('?');
    hc.find('.facet').attr('class', 'facet');
  }

  // Items
  if (local_hero_data && local_hero_data[n]) {
    CreateInventory(hc.find('.hero_card_items'), local_hero_data[n]['items']);
  } else {
    hc.find('.hero_card_items').html('');
  }

  var load_delay = 50;

  if (!heroes_loaded_previously[n]) {
    heroes_loaded_previously[n] = true;
    load_delay = 500;
  }

  setTimeout(function () {
    $('.loading_cover').removeClass('loading_cover');
  }, load_delay);
}

// TOP HUD
function EnableTopHud() {
  $('.top_hud').removeClass('hidden');
}

function DisableTopHud() {
  $('.top_hud').addClass('hidden');
}

// BOTTOM HUD
function EnableBottomHud() {
  $('.bottom_hud').removeClass('hidden');
}

function DisableBottomHud() {
  $('.bottom_hud').addClass('hidden');
}

// Bottom hud abilities
function SetSelectedHero(selected_hero) {
  var bot = $('.bottom_hud');

  // console.log(selected_hero);

  bot.find('.abilities').html('');

  let ability_count = 0;
  Object.keys(selected_hero['abilities']).forEach(function (ability_index) {
    let ability_name = selected_hero['abilities'][ability_index]['name'];
    let ability = GetAbilityByClass(ability_name);

    if (!CheckForBottomHUD(ability)) {
      // console.log("Innate ability, skipping", ability['name']);
      return;
    }
    var ability_box_e = $('<div class="ability"></div>');

    ability_box_e.attr('data-ability-name', ability_name);
    ability_box_e.attr('data-hero-name', selected_hero['name']);

    bot.find('.abilities').append(ability_box_e);
    ability_count++;
  });

  bot.find('.abilities').attr('class', 'abilities');
  if (ability_count > 5) {
    bot.find('.abilities').addClass('SixAbilities');
  } else if (ability_count > 4) {
    bot.find('.abilities').addClass('FiveAbilities');
  } else if (ability_count == 4) {
    bot.find('.abilities').addClass('FourAbilities');
  }

  bot.find('.aghs').attr('data-hero-name', selected_hero['name']);
  bot.find('.talents').attr('data-hero-name', selected_hero['name']);

  // OGRE LEARNING CURVE
  if (
    selected_hero['name'] == 'npc_dota_hero_ogre_magi' &&
    selected_hero['facet'] == '2'
  ) {
    bot.find('.talents').attr('data-ogre-learning-curve', '1');
  } else {
    bot.find('.talents').attr('data-ogre-learning-curve', '0');
  }

  bot
    .find('.facet_and_innate_hitbox')
    .attr('data-hero-name', selected_hero['name']);
  if (selected_hero['facet']) {
    bot
      .find('.facet_and_innate_hitbox')
      .attr('data-selected-facet', selected_hero['facet']);
  }

  Object.keys(selected_hero['items']).forEach(function (item_slot) {
    var item = selected_hero['items'][item_slot];
    var item_box_e = bot.find('.items>.item_frame.' + item_slot);

    if (item.name != 'empty') {
      item_box_e.attr('data-item', item.name);
    } else {
      item_box_e.attr('data-item', '');
    }
  });
}

// Ability Video Preview

function PlayAbilityVideo(ability, hero_name) {
  let ability_video_box = $('.ability_video_preview_container');
  ability_video_box.addClass('open');

  ability_video_box.find('.ability_video_preview_player').addClass('loading');
  setTimeout(function () {
    ability_video_box.find('.ability_video_name').text(ability['name']);
    ability_video_box
      .find('.ability_video_icon')
      .attr('src', ASSETS.spellicon(ability['n']));

    ability_video_box
      .find('#ability_video_webm')
      .attr('src', ASSETS.ability_video(hero_name, ability['n'], 'webm'));
    ability_video_box.find('.ability_video_preview_player').get(0).load();

    setTimeout(function () {
      ability_video_box
        .find('.ability_video_preview_player')
        .removeClass('loading');
    }, 250);
  }, 100);
}

// TWITCH API STUFF
var token = '';
var tuid = '';
var ebs = '';
var channel = '';
var channel_id = '';
var twitch = window.Twitch.ext;

var broadcast_delay = 0;

twitch.onContext(function (context) {
  channel = context.playerChannel;
  broadcast_delay = context.hlsLatencyBroadcaster;
});

twitch.onAuthorized(function (auth) {
  token = auth.token;
  tuid = auth.userId;
  channel_id = auth.channelId;

  if (twitch.viewer.opaqueId && !twitch.viewer.opaqueId.startsWith('A')) {
    GetViewerSettings(twitch.viewer.opaqueId);
  }

  if (!first_pub_sub && !$.isEmptyObject(local_heroes)) {
    first_pub_sub = true;
    GetPubSubData(channel_id);
  }
});

// Viewer Settings
function GetViewerSettings(opaque_id) {
  $.ajax({
    type: 'GET',
    url: location.protocol + '//' + EBS_URL + '/viewer/' + opaque_id,
    success: ReceivedViewerSettings,
  });
}

function ReceivedViewerSettings(data) {
  // console.log(data)

  if (
    data['extension_setting_language'] &&
    data['extension_setting_language'] != local_language
  ) {
    SetLanguage(data['extension_setting_language']);
  }

  if (data['extension_setting_inital_prompt']) {
    promp_users = true;
    $('#extension_setting_inital_prompt').addClass('toggle_selected');
  } else {
    promp_users = false;
    promp_ability_arena_toast = false;
    $('#extension_setting_inital_prompt').removeClass('toggle_selected');
  }
}

var local_data = {};

function GetPubSubData(channel_id) {
  $.ajax({
    type: 'GET',
    url: location.protocol + '//' + EBS_URL + '/data/pubsub/' + channel_id,
    success: ReceivedPubSubData,
    error: logError,
  });
}

var promp_users = true;

let promp_ability_arena_toast = true;

var top_hud_heroes = [];
var local_selected_hero_data;
var local_hero_data;

function ReceivedPubSubData(data) {
  // console.log(data);
  if (
    data['active_game']['heroes'] &&
    data['active_game']['heroes'].length == 10
  ) {
    EnableTopHud();

    if (
      JSON.stringify(data['active_game']['heroes']) !=
      JSON.stringify(top_hud_heroes)
    ) {
      if ($('.mobile_panel').length) {
        RenderMobilePanel(data['active_game']['heroes']);
      }

      if (promp_users) {
        promp_users = false;

        $('.user_prompt_to_click').addClass('open');
        $('.content').addClass('highlight_spells');

        setTimeout(function () {
          $('.user_prompt_to_click').removeClass('open');
          $('.content').removeClass('highlight_spells');
        }, 12000);

        setTimeout(function () {
          // promp_users = true;
        }, 1000 * 60 * 15);
      }
    }

    top_hud_heroes = data['active_game']['heroes'];
  } else {
    top_hud_heroes = [];
    DisableTopHud();
    $('.left_menu').removeClass('enabled');

    if ($('.mobile_panel').length) {
      ClearMobilePanel();
    }
  }

  if (
    data['active_game']['gsi_state'] &&
    (data['active_game']['gsi_state'] == 'playing' ||
      data['active_game']['gsi_state'] == 'spectating') &&
    data['active_game']['selected_hero']
  ) {
    SetSelectedHero(data['active_game']['selected_hero_data']);
    local_selected_hero_data = data['active_game']['selected_hero_data'];
    EnableBottomHud();

    if (
      data['active_game']['gsi_state'] == 'playing' &&
      data['active_game']['selected_hero_data']
    ) {
      SetMobileStreamerHeroDetails(data['active_game']['selected_hero_data']);
    } else if (
      data['active_game']['gsi_state'] == 'spectating' &&
      data['active_game']['hero_data']
    ) {
      SetMobileHeroDetails(data['active_game']['hero_data']);
      local_hero_data = data['active_game']['hero_data'];
    }
  } else {
    local_selected_hero_data = {};
    local_hero_data = {};
    DisableBottomHud();
  }

  var ext_mode_e = $('.extension_mode_box');
  if (data['active_game']['gsi_state']) {
    // ext_mode_e.attr('class', 'extension_mode_box');

    if (data['active_game']['gsi_state'] == 'playing') {
      $('.left_menu').addClass('enabled');

      if (!ext_mode_e.hasClass('gaming')) {
        switchingModes();
      }

      ext_mode_e.addClass('gaming');
      ext_mode_e.removeClass('spectator');
      ext_mode_e
        .find('.menu_tooltip.mode .menu_tooltip_title')
        .text(ext_modes['gaming']['title']);
      ext_mode_e
        .find('.menu_tooltip.mode .menu_tooltip_text')
        .text(ext_modes['gaming']['text']);
    } else if (data['active_game']['gsi_state'] == 'spectating') {
      $('.left_menu').addClass('enabled');

      if (!ext_mode_e.hasClass('spectator')) {
        switchingModes();
      }

      ext_mode_e.addClass('spectator');
      ext_mode_e.removeClass('gaming');
      ext_mode_e
        .find('.menu_tooltip.mode .menu_tooltip_title')
        .text(ext_modes['spectator']['title']);
      ext_mode_e
        .find('.menu_tooltip.mode .menu_tooltip_text')
        .text(ext_modes['spectator']['text']);
    } else {
      $('.left_menu').removeClass('enabled');
    }

    // Ability Arena
    if (data['active_game']['gsi_state'] == 'custom_game_ability_arena') {
      LoadEnabledAbilities();
      LoadEnabledGods();

      $('.custom_game_ability_arena').addClass('enabled');

      if (promp_ability_arena_toast) {
        promp_ability_arena_toast = false;
        setTimeout(function () {
          $('.ability_arena_side_shelf').addClass('reveal_toast');
        }, 1000);

        setTimeout(function () {
          $('.ability_arena_side_shelf').removeClass('reveal_toast');
        }, 10000);
      }
    } else {
      $('.custom_game_ability_arena').removeClass('enabled');
    }
  } else {
    $('.left_menu').removeClass('enabled');
    $('.custom_game_ability_arena').removeClass('enabled');
    ext_mode_e.removeClass('spectator');
    ext_mode_e.removeClass('gaming');
  }
}

var ext_modes = {
  spectator: {
    title: 'Spectator Mode',
    text: 'In Spectator Mode, the bottom HUD will work for every hero. The top HUD will work with no delay.',
  },
  gaming: {
    title: 'Gaming Mode',
    text: 'In Gaming Mode, the bottom HUD will only work for the hero that the streamer is playing. The top HUD will work with a delay.',
  },
};

function switchingModes() {
  $('.extension_mode_box').addClass('switched_modes');

  setTimeout(function () {
    $('.extension_mode_box').removeClass('switched_modes');
  }, 10000);
}

function logError(_, error, status) {
  if (testing) {
    console.log('error', error);
  }
  twitch.rig.log('EBS request returned ' + status + ' (' + error + ')');
}

// AUTO-SCALE to fit player
$(window).on('resize', function () {
  var win = $(this);
  DoResize();
});

var ui_rescale = 1;
function DoResize() {
  var scale;
  var content = $('.auto-scale>.content');

  scale = Math.min(
    $(window).width() / content.width(),
    $(window).height() / content.height()
  );
  ui_rescale = scale;
  content.css({
    transform: 'translate(-50%, -50%) ' + 'scale(' + scale + ')',
  });
}

// ---------
// MOBILE UI
// ---------

function RenderMobilePanel(heroes) {
  if (heroes && heroes.length == 10) {
    $('.mobile_panel .hero_list').html('');
    $('.waiting_for_data').hide();
    for (var i = 0; i < heroes.length; i++) {
      if (i == 0) {
        $('.mobile_panel .hero_list').append(
          '<div class="team_title radiant">THE RADIANT</div>'
        );
      } else if (i == 5) {
        $('.mobile_panel .hero_list').append(
          '<div class="team_title dire">THE DIRE</div>'
        );
      }

      RenderMobileHeroRow(local_heroes[heroes[i]], i);
    }
  }
}

function ClearMobilePanel() {
  $('.mobile_panel .hero_list').html('');
  $('.waiting_for_data').show();
}

function RenderMobileHeroRow(hero, hero_index) {
  let hero_e = $(`<div class="hero_row">
		<div class="hero_row_heading">
			<div class="hero_row_icon">
				<img src="" width="100px" height="56px" />
			</div>
			<div class="hero_row_title">
				<h1>
					<img class="hero_attribute_icon" src="" width="24px" height="24px" />
					<span>Mars</span>
				</h1>
			</div>
		</div>
		<div class="hero_row_content">
			<div class="hero_row_short">Traps his foes in an inescapable arena</div>
			<div class="hero_row_tabs">
				<div class="selected" data-tab-index="0">ABILITIES</div>
				<span>/</span>
				<div data-tab-index="1"><div class="hero_row_aghs_icon hero_row_tab_icon"></div></div>
				<span>/</span>
				<div data-tab-index="2"><div class="hero_row_talent_icon hero_row_tab_icon"></div></div>
				<span>/</span>
				<div data-tab-index="3">ITEMS</div>
			</div>
			<div class="hero_row_tab_windows" data-tab-position="0" style="width:400%">
				<div class="hero_row_tab_window selected">
					<div class="hero_row_abilities_top">
						<div class="hero_row_abilities"></div>
						<div class="hero_row_aghs"></div>
						<div class="hero_row_talents"></div>
					</div>
					<div class="hero_row_abilities_body">
					</div>
				</div>
				<div class="hero_row_tab_window aghs_tab">
				</div>
				<div class="hero_row_tab_window talent_tab">
				</div>
				<div class="hero_row_tab_window items_tab">
					<p class="coming_soon mobile_items_info">With Gaming Mode, items will only show for the streamer's hero.</p>
					<div class="item_list"></div>
				</div>
			</div>
		</div>
	</div>`);

  hero_e.attr('data-hero-name', hero['n']);
  hero_e.find('.hero_row_title>h1>span').text(hero['Name']);
  hero_e.find('.hero_row_short').text(hero['Short']);
  hero_e.find('.hero_row_icon>img').attr('src', ASSETS.hero_icon(hero['n']));
  hero_e
    .find('.hero_attribute_icon')
    .attr('src', ASSETS.attribute_icon[hero['AttributePrimary']]);
  hero_e.find('.hero_row_abilities').attr('data-hero-name', hero['n']);

  var ability_count = 0;
  for (var i = 0; i < hero.abilities.length; i++) {
    var ability = hero.abilities[i];
    if (CheckForHeroCard(ability) == false) {
      continue;
    }
    var ability_box_e = $(
      '<div class="ability_box"><img src="" width="60px" height="60px" /></div>'
    );
    ability_box_e.find('img').attr('src', ASSETS.spellicon(ability['n']));
    ability_box_e.attr('data-hero-name', hero['n']);
    ability_box_e.attr('data-ability-name', ability['n']);
    if (i == 0) {
      ability_box_e.addClass('selected');
      hero_e
        .find('.hero_row_abilities_body')
        .append(AbilityTooltip(ability, hero['n']));
    }
    hero_e.find('.hero_row_abilities').append(ability_box_e);

    ability_count++;
  }

  if (ability_count == 6) {
    hero_e.find('.hero_row_abilities').addClass('small_ability_icons');
  }

  hero_e.find('.aghs_tab').append(`<div class="aghs_box">
			<div class="aghs_shard_tooltip aghs_upgrade">
				<div class="top">
					<div class="aghs_icon">
						<div class="aghs_icon_frame">
							<img src="./images/dota/scepter_on.png">
							<div class="aghs_glow"></div>
						</div>
					</div>
					<div class="aghs_title_box">
						<div class="aghs_title">Aghanim's Scepter</div>
						<div class="aghs_title_shadow">Aghanim's Scepter</div>
					</div>
				</div>
				<div class="body">
					<div class="affected_ability_icon">
						<img src="" width="48px" height="48px" />
					</div>
					<div>
						<div class="affected_ability">
							<div class="affected_ability_title"></div>
							<div class="upgrade">UPGRADE</div>
						</div>
						<div class="affected_ability_desc">
						</div>
					</div>
				</div>
				<div class="body-none">
					This hero has no upgrade.
				</div>
			</div>
			<div class="aghs_connector"></div>
			<div class="aghs_shard_tooltip shard_upgrade">
				<div class="top">
					<div class="aghs_icon">
						<div class="aghs_icon_frame">
							<img src="./images/dota/shard_on.png">
							<div class="aghs_glow"></div>
						</div>
					</div>
					<div class="aghs_title_box">
						<div class="aghs_title">Aghanim's Shard</div>
						<div class="aghs_title_shadow">Aghanim's Shard</div>
					</div>
				</div>
				<div class="body">
					<div class="affected_ability_icon">
						<img src="" width="48px" height="48px" />
					</div>
					<div>
						
						<div class="affected_ability">
							<div class="affected_ability_title"></div>
							<div class="upgrade">UPGRADE</div>
						</div>
						<div class="affected_ability_desc">
						</div>
					</div>
				</div>
				<div class="body-none">
					This hero has no upgrade.
				</div>
			</div>
		</div>`);

  RenderAghsTooltip(
    GetAghsUpgrades(hero),
    GetShardUpgrades(hero),
    hero_e.find('.aghs_box')
  );

  hero_e.find('.talent_tab').append(`<div class="talent_box">
		<div class="talent_tree_title">TALENT TREE</div>
		<div>
			<div class="talent_row">
				<div class="talent_cell talent_8">e</div>
				<div class="talent_level">
					<div>25</div>
				</div>
				<div class="talent_cell talent_7"></div>
			</div>
			<div class="talent_row">
				<div class="talent_cell talent_6"></div>
				<div class="talent_level">
					<div>20</div>
				</div>
				<div class="talent_cell talent_5"></div>
			</div>
			<div class="talent_row">
				<div class="talent_cell talent_4"></div>
				<div class="talent_level">
					<div>15</div>
				</div>
				<div class="talent_cell talent_3"></div>
			</div>
			<div class="talent_row">
				<div class="talent_cell talent_2"></div>
				<div class="talent_level">
					<div>10</div>
				</div>
				<div class="talent_cell talent_1"></div>
			</div>
		</div>
	</div>`);

  TalentTooltip(hero['talents'], hero_e.find('.talent_box'));

  $('.mobile_panel .hero_list').append(hero_e);
}

function setHeroRowTabPosition(tabs, position) {
  tabs
    .parents('.hero_row')
    .find('.hero_row_tabs .selected')
    .removeClass('selected');
  tabs
    .parents('.hero_row')
    .find(`.hero_row_tabs div[data-tab-index="${position}"]`)
    .addClass('selected');

  let tab_count = tabs.find('>div').length;
  tabs.css({
    transform: `translateX(-${position * (100 / tab_count)}%)`,
  });
  tabs.attr('data-tab-position', position);
}

function createRipple(event) {
  const button = event.currentTarget;

  const circle = document.createElement('span');
  const target_el = button.parentNode;
  const diameter = Math.max(target_el.clientWidth, target_el.clientHeight);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.pageX - target_el.offsetLeft - radius}px`;
  circle.style.top = `${event.pageY - target_el.offsetTop - radius}px`;
  circle.classList.add('ripple');

  const ripple = target_el.getElementsByClassName('ripple')[0];

  if (ripple) {
    ripple.remove();
  }

  target_el.appendChild(circle);
}

function CreateInventory(container, inventory, backpack) {
  // Items
  if (container.find('.item_list_base').length < 1) {
    container.append('<div class="item_list_base"></div>');
  }

  container.find('.item_list_base').html('');
  for (var i = 0; i < 9; i++) {
    if (inventory && inventory['slot' + i]) {
      let item = inventory['slot' + i];
      let item_e = $('<div class="item_slot"></div>');

      if (backpack || i < 6) {
        if (item['name'] != 'empty') {
          item_e.append('<img class="item_icon" src="" />');
          item_e.find('.item_icon').attr('src', ASSETS.itemicon(item['name']));
          item_e.find('.item_icon').attr('data-item-name', item['name']);

          if (item['charges']) {
            item_e.append('<div class="item_charges"></div>');
            item_e.find('.item_charges').text(item['charges']);
          }
        }

        if (i == 6) {
          container.find('.item_list_base').append('<hr>');
        }

        container.find('.item_list_base').append(item_e);
      }
    }
  }

  // Item Neutral Slot

  if (container.find('.item_neutral_slot').length < 1) {
    container.append('<div class="item_neutral_slot"></div>');
  }

  if (inventory && inventory['neutral0']) {
    let item = inventory['neutral0'];
    let item_e = container.find('.item_neutral_slot');
    item_e.html('');

    if (item['name'] != 'empty') {
      item_e.append('<img class="item_icon" src="" />');
      item_e.find('.item_icon').attr('src', ASSETS.itemicon(item['name']));
      item_e.find('.item_icon').attr('data-item-name', item['name']);
    }
  }
}

function SetTalentSelection(talent_box, hero_data) {
  talent_box.find('.selected').removeClass('selected');

  for (var i = 0; i < hero_data['t'].length; i++) {
    if (hero_data['t'][i]) {
      talent_box.find('.talent_' + parseInt(i + 1)).addClass('selected');
    }
  }
}

function SetMobileHeroDetails(hero_data) {
  Object.keys(hero_data).forEach(function (hero_n) {
    let hero_row_e = $('.mobile_panel .hero_list').find(
      `.hero_row[data-hero-name="${hero_n}"]`
    );

    if (hero_row_e) {
      hero_row_e.find('.mobile_items_info').hide();

      CreateInventory(
        hero_row_e.find('.item_list'),
        hero_data[hero_n]['items'],
        true
      );

      let items_tab = hero_row_e.find('.items_tab');
      if (items_tab.find('.item_details').length < 1) {
        items_tab.append(
          '<div class="item_details">Tap on one of the items to read details.</div>'
        );
      }

      SetTalentSelection(hero_row_e.find('.talent_box'), hero_data[hero_n]);
    }
  });
}

function SetMobileStreamerHeroDetails(hero_data) {
  // console.log(hero_data);

  let hero_n = hero_data['name'];
  let hero_row_e = $('.mobile_panel .hero_list').find(
    `.hero_row[data-hero-name="${hero_n}"]`
  );

  if (hero_row_e) {
    hero_row_e.addClass('streamer_row');
    if (hero_row_e.find('.streamer_hero').length < 1) {
      hero_row_e
        .find('.hero_row_title')
        .append('<div class="streamer_hero">STREAMER</div>');
    }

    CreateInventory(hero_row_e.find('.item_list'), hero_data['items'], true);

    let items_tab = hero_row_e.find('.items_tab');
    if (items_tab.find('.item_details').length < 1) {
      items_tab.append(
        '<div class="item_details">Tap on one of the items to read details.</div>'
      );
    }

    SetTalentSelection(hero_row_e.find('.talent_box'), hero_data);

    // Update talent selection
  }
}

$(function () {
  // console.log("Awaiting data...");

  $('.hero_list').on('click', '.hero_row_heading', function (event) {
    // Disabled for performance
    // createRipple(event);

    $([document.documentElement, document.body]).animate(
      {
        scrollTop: $(this).parents('.hero_row').offset().top - 15,
      },
      500
    );

    let hero_row = $(this).parents('.hero_row');

    if (!hero_row.hasClass('pre_open')) {
      hero_row.toggleClass('pre_open');
      setTimeout(function () {
        hero_row.toggleClass('open');
      }, 10);
    } else {
      hero_row.toggleClass('open');
      setTimeout(function () {
        hero_row.toggleClass('pre_open');
      }, 250);
    }
  });

  $('.hero_list').on('click', '.hero_row_tabs>div', function (event) {
    let tab_index = $(this).attr('data-tab-index');
    setHeroRowTabPosition(
      $(this).parents('.hero_row').find('.hero_row_tab_windows'),
      tab_index
    );
  });

  $('.hero_list').on(
    'click',
    '.hero_row_abilities .ability_box ',
    function (event) {
      var ability_name = $(this).attr('data-ability-name');
      var hero_name = $(this).attr('data-hero-name');

      var ability;
      if (local_heroes[hero_name]) {
        for (var i = 0; i < local_heroes[hero_name]['abilities'].length; i++) {
          if (local_heroes[hero_name]['abilities'][i]['n'] == ability_name) {
            ability = local_heroes[hero_name]['abilities'][i];
          }
        }
      }

      $(this).parents('.hero_row').find('.hero_row_abilities_body').html('');
      $(this)
        .parents('.hero_row')
        .find('.hero_row_abilities_body')
        .append(AbilityTooltip(ability, hero_name));

      $(this)
        .parent('.hero_row_abilities')
        .find('.selected')
        .removeClass('selected');
      $(this).addClass('selected');
    }
  );

  $('.hero_list').on('click', '.item_list .item_icon ', function (event) {
    let item_name = $(this).attr('data-item-name');
    if (local_items[item_name]) {
      $(this).parents('.items_tab').find('.item_details').html('');
      $(this)
        .parents('.items_tab')
        .find('.item_details')
        .append(ItemTooltip(local_items[item_name]));

      $(this).parent('.item_list').find('.selected').removeClass('selected');
      $(this).addClass('selected');
    }
  });
});
