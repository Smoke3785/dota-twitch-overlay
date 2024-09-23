let ability_arena_spell_search = '';
let ability_arena_god_search = '';

$(function () {
  $('.content')
    .off('mousedown')
    .on('mousedown', function (event) {
      if (event.target.id == 'main_box') {
        HideAbilityArenaBox();
      }
      //Rest remains the same
    });

  function HideAbilityArenaBox() {
    $('.ability_arena_box').removeClass('open');
    $('.ability_arena_menu_box').removeClass('open');
  }

  function ShowAbilityArenaBox() {
    $('.ability_arena_box').addClass('open');
    $('.ability_arena_menu_box').addClass('open');
  }

  let first_click = true;

  $('.ability_arena_menu_box').click(function () {
    if ($(this).hasClass('open')) {
      HideAbilityArenaBox();
    } else {
      ShowAbilityArenaBox();
      if (first_click) {
        RenderAbilityArenaGods();
        first_click = false;
      }
    }
  });

  $('.ability_arena_tab_click').click(function () {
    let tab = $(this).attr('data-tab');

    $('.ability_arena_tab.active').removeClass('active');
    $('.ability_arena_tab.' + tab).addClass('active');

    if (tab == 'tab_spells') {
      RenderAbilityArenaSpells();
    } else if (tab == 'tab_gods') {
      RenderAbilityArenaGods();
    }

    $('.ability_arena_tab_click.active').removeClass('active');
    $(this).addClass('active');
  });

  $('#ability_arena_spell_input').on('input', function () {
    ability_arena_spell_search = $(this).val();
    RenderAbilityArenaSpells();
  });

  $('#ability_arena_god_input').on('input', function () {
    ability_arena_god_search = $(this).val();
    RenderAbilityArenaGods();
  });

  $('.content').on('mouseenter', '.ability_arena_god_power', function () {
    var power_id = $(this).attr('data-power-id');
    if (ability_arena_god_powers[power_id]) {
      $('.ability_arena_tooltips').append(
        RenderAbilityArenaGodPowerTooltip(
          ability_arena_god_powers[power_id],
          $(this)
        )
      );
    }
  });

  $('.content').on('mouseleave', '.ability_arena_god_power', function () {
    $('.ability_arena_tooltips').html('');
  });

  // LoadEnabledAbilities();
  // LoadEnabledGods();
});

// Abilities
let ability_arena_spells = [];
function LoadAbilityArenaSpells() {
  $.ajax({
    url: 'https://dotatooltips.b-cdn.net/ability_arena/abilities.json',
    dataType: 'json',
    success: function (data) {
      ability_arena_spells = data;
      // RenderAbilityArenaSpells();
    },
    error: function () {
      console.log('Error loading Ability Arena spells');
    },
  });
}

let enabled_abilities = null;
function LoadEnabledAbilities() {
  if (enabled_abilities != null) {
    return;
  }

  $.ajax({
    url: 'https://dotatooltips.b-cdn.net/ability_arena/enabled_abilities.json',
    dataType: 'json',
    success: function (data) {
      enabled_abilities = data.enabled_abilities;
      LoadAbilityArenaSpells();
    },
    error: function () {
      console.log('Error loading enabled_abilities');
    },
  });
}

function RenderAbilityArenaSpellTooltip(ability_list, spell) {
  let ability_spell_e = $(`<div class="ability_arena_spell">
			<div class="ability_arena_header">
			<img
				src="https://www.abilityarena.com/images/ability_icons/${spell.icon}.png"
				class="ability_arena_ability_icon"
			/>
			<div class="ability_arena_ability_name">${spell.name}</div>
			</div>
			<div class="ability_arena_categories"></div>
			<div class="ability_arena_separator"></div>
			<div class="ability_arena_ability_description">${spell.description}</div>
			<div class="ability_arena_ability_values">
			</div>
			<div class="ability_arena_mana_cd_cost">
			</div>
			<div class="sink">
				<div class="super">
					<span style="color: rgb(99, 117, 255)">Super: </span><span> ${spell.superUpgrade}</span>
				</div>
				<div class="gaben">
					<span style="color: rgb(254, 116, 0)">Gaben: </span><span>${spell.gabenUpgrade}</span>
				</div>
			</div>
		</div>
		`);

  if (spell.cooldowns.length > 0) {
    let cooldowns_e = $(`<div class="ability_arena_cooldown">
				<div class="cooldown-icon"></div>
				<span> ${spell.cooldowns.join(' / ')} </span>
			</div>`);
    ability_spell_e.find('.ability_arena_mana_cd_cost').append(cooldowns_e);
  }

  if (spell.manaCost.length > 0) {
    let mana_cost_e = $(`<div class="ability_arena_mana_cost">
				<div class="mana-cost-icon"></div>
				<span> ${spell.manaCost.join(' / ')} </span>
			</div>`);
    ability_spell_e.find('.ability_arena_mana_cd_cost').append(mana_cost_e);
  }

  if (spell.differences) {
    let differences_e = $(`<div class="differences">
				<span style="color: rgb(142, 134, 118)">Differences from Dota: </span><span> ${spell.differences}</span>
			</div>`);

    ability_spell_e.find('.sink').append(differences_e);
  }

  let ability_categories = ability_spell_e.find('.ability_arena_categories');
  for (let i = 0; i < spell.categories.length; i++) {
    let category = spell.categories[i];
    let category_e = $(`<div class="ability_arena_category">${category}</div>`);
    ability_categories.append(category_e);
  }

  let ability_values = ability_spell_e.find('.ability_arena_ability_values');
  for (let i = 0; i < spell.values.length; i++) {
    let value = spell.values[i].split(':');

    let value_e = $(`<div>
				<span class="ability_arena_ability_value_desc">${value[0]}: </span>
				<span class="ability_arena_ability_value">${value[1]}</span>
			</div>`);
    ability_values.append(value_e);
  }
  ability_list.append(ability_spell_e);
}

function RenderAbilityArenaSpells() {
  let ability_list = $('.ability_arena_spell_list');
  ability_list.html('');
  for (let i = 0; i < ability_arena_spells.length; i++) {
    let spell = ability_arena_spells[i];

    if (ability_arena_spell_search) {
      if (
        spell.name
          .toLowerCase()
          .indexOf(ability_arena_spell_search.toLowerCase()) == -1
      ) {
        continue;
      }
    }

    if (enabled_abilities) {
      if (enabled_abilities.indexOf(spell.id) == -1) {
        continue;
      }
    }

    RenderAbilityArenaSpellTooltip(ability_list, spell);
  }
}

const TAGS = [
  'attackDamage',
  'attackModifier',
  'attackRange',
  'attackSpeed',
  'break',
  'buff',
  'damageAmplification',
  'dispel',
  'displacement',
  'healing',
  'instantAttack',
  'lifesteal',
  'magicDamage',
  'magicImmunity',
  'manaRegeneration',
  'mobility',
  'passive',
  'pureDamage',
  'silence',
  'spam',
  'stats',
  'stun',
  'summons',
  'ultimate',
];

// Gods
let ability_arena_gods = [];
function LoadAbilityArenaGods() {
  $.ajax({
    url: 'https://dotatooltips.b-cdn.net/ability_arena/gods.json',
    dataType: 'json',
    success: function (data) {
      ability_arena_gods = data;
      // RenderAbilityArenaGods();
    },
    error: function () {
      console.log('Error loading Ability Arena gods');
    },
  });
}

let enabled_gods = null;
function LoadEnabledGods() {
  if (enabled_gods != null) {
    return;
  }

  $.ajax({
    url: 'https://dotatooltips.b-cdn.net/ability_arena/enabled_gods.json',
    dataType: 'json',
    success: function (data) {
      enabled_gods = data;
      LoadAbilityArenaGods();
    },
    error: function () {
      console.log('Error loading enabled_gods');
    },
  });
}

function isGodEnabled(god_name) {
  for (let i = 0; i < enabled_gods.length; i++) {
    const e_god = enabled_gods[i];
    if (e_god.god_name == god_name && e_god.god_enabled) {
      return true;
    }
  }
  return false;
}

let ability_arena_god_powers = {};
function RenderAbilityArenaGods() {
  let god_list = $('.ability_arena_god_list');
  god_list.html('');
  ability_arena_god_powers = {};

  for (let i = 0; i < ability_arena_gods.length; i++) {
    let god = ability_arena_gods[i];

    if (ability_arena_god_search) {
      if (
        god.name
          .toLowerCase()
          .indexOf(ability_arena_god_search.toLowerCase()) == -1
      ) {
        continue;
      }
    }

    if (!isGodEnabled(god.id)) {
      continue;
    }

    RenderAbilityArenaGodCard(god_list, god);
  }
}

function RenderAbilityArenaGodCard(god_list, god) {
  let god_e = $(`
		<div class="ability_arena_god_card">
			<div class="ability_arena_god_content">
				<div class="ability_arena_god_name">${god.name}</div>
				<div class="ability_arena_god_powers"></div>
				<div class="ability_arena_god_universe">
				<img src="https://www.abilityarena.com/images/logos/${god.universe}_logo.png" class="ability_arena_god_universe_icon" />
				</div>
				<div class="ability_arena_god_hp">${god.health}</div>
			</div>
			<div class="ability_arena_god_avatar">
				<img src="https://www.abilityarena.com/images/gods/images/${god.id}_avatar.png" class="ability_arena_god_avatar_icon" />
			</div>
			<div class="ability_arena_god_frame"><img src="./images/ability_arena/god_card_frame.png"/></div>
			</div>
			`);

  let god_powers = god_e.find('.ability_arena_god_powers');
  for (let i = 0; i < god.powers.length; i++) {
    let power = god.powers[i];
    let power_e = $(`
		<div class="ability_arena_god_power"><img src="https://www.abilityarena.com/images/gods/powers/power_${power.id}.png" class="ability_arena_god_power_image" /><img class="active_type_frame" src="./images/ability_arena/god_card_power_active.png"/></div>
		`);

    if (power.type != 'passive') {
      power_e.addClass('active_type');
    }

    ability_arena_god_powers[power.id] = power;

    power_e.attr('data-power-id', power.id);

    god_powers.append(power_e);
  }

  god_list.append(god_e);
}

function RenderAbilityArenaGodPowerTooltip(power, target) {
  let power_tooltip = $(`
		<div class="ability_arena_god_power_tooltip">
			<div class="ability_arena_god_power_name">${power.name}</div>
			<div class="ability_arena_god_power_type">${power.type_string}</div>
			<div class="ability_arena_god_power_description">${power.desc}</div>
			<div class="ability_arena_god_power_values"></div>
		</div>
	`);

  for (let i = 0; i < power.values.length; i++) {
    const power_value = power.values[i].split(':');
    let power_value_e = $(`
			<div class="ability_arena_god_power_value">
				<div class="ability_arena_god_power_value_name">${power_value[0]}:</div>
				<div class="ability_arena_god_power_value_value">${power_value[1]}</div>
			</div>
		`);

    power_tooltip.find('.ability_arena_god_power_values').append(power_value_e);
  }

  var position = target.offset();
  var scale_offset = $('.content').offset();

  var x_offset =
    (position.left - scale_offset.left) * (1 / ui_rescale) + target.width() / 2;
  var y_offset =
    (position.top - scale_offset.top) * (1 / ui_rescale) - target.height() / 2;

  power_tooltip.css({
    top: y_offset,
    left: x_offset - 410,
  });

  return power_tooltip;
}
