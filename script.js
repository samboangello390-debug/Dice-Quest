const VERSION =
"v1.0";

let player = JSON.parse(
localStorage.getItem("rpgSave")
) || {

hp:20,
maxHp:20,

attackDice:6,
damageDice:5,

ac:5,

gold:0,

exp:0,

level:1,
};

player.baseDamage ??= 5;
player.baseAC ??= 5;

player.bonusDamage ??= 0;
player.bonusAC ??= 0;

player.inventory ??= [];

player.equipment ??= {
weapon:null,
armor:null
};

player.growth ??= {
damage:0,
ac:0,
last:""
};

let enemy = null;

function roll(max){

return Math.floor(
Math.random()*max
)+1;

}
const stats =
document.getElementById("stats");

const text =
document.getElementById("gameText");

const buttons =
document.getElementById("buttons");



function save(){

localStorage.setItem(
"rpgSave",
JSON.stringify(player)
);

}



function updateStats(){

stats.innerHTML=
`
Version:
${VERSION}

<br>

❤️ HP:
${player.hp}/${player.maxHp}

<br>

🎲 DMG:
D${player.baseDamage+
player.bonusDamage}

<br>

🛡️ AC:
${player.baseAC+
player.bonusAC}

<br>

⭐ LV:
${player.level}

<br>

✨ EXP:
${player.exp}/
${player.level*50}

<br>

💰 GOLD:
${player.gold}
`;

}



function setButtons(list){

buttons.innerHTML="";

list.forEach(btn=>{

let b=
document.createElement("button");

b.textContent=
btn.text;

b.onclick=
btn.action;

buttons.appendChild(b);

});

}



function showTown(){

updateStats();

text.innerHTML=
`
You stand at camp.
What will you do?
`;

setButtons([

{
text:"🌲 Explore",
action:explore
},

{
text:"💤 Rest",
action:rest
},

{
text:"💾 Save",
action:()=>{
save();

text.innerHTML=
"Game saved.";
}
}

]);

}



function explore(){

const enemies=[

{
name:"Slime",
hp:10,

ac:3,

attackDice:6,

damageDice:3
},

{
name:"Goblin",
hp:15,

ac:4,

attackDice:6,

damageDice:5
},

{
name:"Wolf",
hp:18,

ac:5,

attackDice:8,

damageDice:4
}

];

let encounter =
Math.random();

if(
encounter < 0.6
){

enemy =
JSON.parse(
JSON.stringify(
enemies[0]
)
);

}

else if(
encounter < 0.9
){

enemy =
JSON.parse(
JSON.stringify(
enemies[1]
)
);

}

else{

enemy =
JSON.parse(
JSON.stringify(
enemies[2]
)
);

}

enemy.maxHp =
enemy.hp;

enemy.intent =
[
"normal",
"strong",
"accurate"
][
Math.floor(
Math.random()*3
)
];

battle();

}



function battle(log=""){

updateStats();

text.innerHTML =
`
${log}

<br><br>

Enemy:
${enemy.name}

<br>

HP:
${enemy.hp}/${enemy.maxHp}

<br>

AC:
${enemy.ac}

<br>

Intent:
${enemy.intent}
`;

setButtons([

{
text:"⚔️ Attack",
action:attack
},

{
text:"🛡 Defend",
action:defend
},

{
text:"🌀 Dodge",
action:dodge
},

{
text:
"🎒 Inventory",
action:inventory
},

{
text:"🏃 Run",
action:showTown
}

]);

}



function attack(){

let attackRoll =
roll(player.attackDice);

let log =
`You rolled ${attackRoll}<br>`;


if(
attackRoll === 1
){

enemyTurn(
`
Critical miss!

<br>

You stumble!
`
);

return;

}


if(
attackRoll >= enemy.ac
){

let damage =
roll(
player.baseDamage +
player.bonusDamage
);

if(
attackRoll ===
player.attackDice
){

damage *= 2;

log +=
`
Critical!

<br>
`;

}

enemy.hp -= damage;

log +=
`
Hit!

<br>

Damage:
${damage}
`;

}

else{

log +=
`
Miss!
`;

}



if(
enemy.hp <= 0
){

text.innerHTML =
log;

win();

return;

}



enemyTurn(log);

}



function enemyTurn(log){

let attackRoll =
roll(
enemy.attackDice
);



if(
enemy.intent ===
"accurate"
){

attackRoll++;

}



if(
player.dodge
){

attackRoll -= 2;

player.dodge =
false;

}



log +=
`
<br><br>

Enemy rolled

${attackRoll}

<br>
`;



if(
attackRoll >=
(
player.baseAC +
player.bonusAC
)
){

let damage =
roll(
enemy.damageDice
);



if(
enemy.intent ===
"strong"
){

damage += 2;

}



if(
enemy.damageModifier
){

damage =
Math.ceil(
damage *
enemy.damageModifier
);

enemy.damageModifier =
null;

}



player.hp -=
damage;



log +=
`
You took

${damage}

damage
`;

}

else{

log +=
`
Enemy missed
`;

}



if(
player.hp <= 0
){

gameOver();

return;

}



battle(log);

}


function defend(){

let log =
"You defend.<br>";

enemy.damageModifier =
0.5;

enemyTurn(log);

}

function dodge(){

let log =
"You prepare to dodge.<br>";

player.dodge =
true;

enemyTurn(log);

}

function win(){

let reward=
Math.floor(
Math.random()*10
)+5;

player.gold+=reward;

player.exp+=20;

text.innerHTML=
`
You defeated
${enemy.name}

<br><br>

+20 EXP

<br>

+${reward} Gold
`;

dropItem();

levelCheck();

save();

setButtons([

{
text:"Continue",
action:showTown
}

]);

}

function dropItem(){

let rollDrop =
Math.random();

let item =
null;

if(
rollDrop<0.2
){

item={
name:
"Rusty Sword",

type:
"weapon",

damage:2
};

}

else if(
rollDrop<0.4
){

item={
name:
"Leather Armor",

type:
"armor",

ac:1
};

}



if(item){

player.inventory
.push(
item
);

text.innerHTML +=
`
<br><br>

Loot:

${item.name}
`;

}

}

function equip(index){

let item =
player.inventory[
index
];

if(
item.type===
"weapon"
){

player.equipment
.weapon=
item;

player.bonusDamage=
item.damage;

}

if(
item.type===
"armor"
){

player.equipment
.armor=
item;

player.bonusAC=
item.ac;

}

save();

showTown();

}

function levelCheck(){

if(
player.exp >=
player.level*50
){

player.level++;

player.maxHp+=5;

if(
player.level%5===0
){

let choice=
Mth.random()<0.5
?
"damage"
:
"ac";



if(
choice===
player.growth.last
){

choice=
choice===
"damage"
?
"ac"
:
"damage";

}



if(
choice===
"damage"
&&
player.growth.damage
<10
){

player.baseDamage++;

player.growth.damage++;

}



if(
choice===
"ac"
&&
player.growth.ac
<10
){

player.baseAC++;

player.growth.ac++;

}



player.growth.last=
choice;

}



player.hp=
player.maxHp;

}

}



function rest(){

player.hp=
player.maxHp;

save();

text.innerHTML=
`
You recovered.
`;

setButtons([

{
text:"Continue",
action:showTown
}

]);

}

function inventory(){

updateStats();

text.innerHTML=
`
Inventory
<br><br>
`;

buttons.innerHTML=
"";



player.inventory
.forEach(
(
item,
i
)=>{

let b=
document
.createElement(
"button"
);

b.textContent=
`
Equip
${item.name}
`;

b.onclick=
()=>equip(i);

buttons
.appendChild(
b
);

}
);

}

function gameOver(){

localStorage.removeItem(
"rpgSave"
);

text.innerHTML=
`
YOU DIED

<br><br>

Starting over...
`;

setButtons([

{
text:"Restart",
action:()=>{

player={

hp:20,
maxHp:20,

attack:5,

gold:0,

exp:0,

level:1

};

showTown();

}

}

]);

}



showTown();