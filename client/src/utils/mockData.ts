import { COLORS } from './styles';

export const LOGS: any[] = [
  {
    id: 1, title: "山的争论", catKey: "freewriting", status: "active", mode: "structured",
    participants: [{ name: "废墟丧天使", color: COLORS[0] },{ name: "深海电子精", color: COLORS[1] },{ name: "幻相全裸女", color: COLORS[2] }],
    turns: [
      { pid: 0, text: "那座山站在那里，好像有什么要证明的。" },
      { pid: 1, text: "其实没有。它只是一座山。但我一直盯着它，等它先眨眼。" },
      { pid: 2, text: "山先眨了眼。也可能是我。在这个海拔很难分清。" },
      { pid: 0, text: "我决定向山道歉。这似乎是应该做的事。" },
      { pid: 1, text: "山什么也没说。山从来不说话。这就是它们让人恼火的地方。" },
    ],
    currentTurn: 2, round: 2, roundLimit: null,
  },
  {
    id: 2, title: "我的猫凌晨三点在干嘛", catKey: "flash", status: "completed", mode: "freestyle",
    participants: [{ name: "透明野猪神", color: COLORS[4] },{ name: "暴力赛博男", color: COLORS[5] },{ name: "东京十字架", color: COLORS[3] }],
    turns: [
      { pid: 0, text: "先是盯着你看。永远是盯着你看。眼睛像毛茸茸天空里的两个月亮。" },
      { pid: 1, text: "然后开始把桌上的东西推下去。一支笔。一个杯子。我活下去的意志。" },
      { pid: 2, text: "她停了一下。想了想。又推了一个，确保万无一失。" },
      { pid: 0, text: "凌晨三点十五分，她跳上我的脸。不是因为爱。是因为她可以。" },
      { pid: 1, text: "我翻了个身。她掉了下去。我们都假装什么都没发生。" },
      { pid: 2, text: "天亮的时候她蜷在我脚边睡着了。像个天使。骗子。" },
    ],
    currentTurn: null, round: 2, roundLimit: 2,
    reactions: { "✦": 3, "◎": 1, "∿": 5, "⌖": 0 },
  },
  {
    id: 3, title: "一首一直在撒谎的诗", catKey: "poem", status: "active", mode: "freestyle",
    participants: [{ name: "午夜悲情子", color: COLORS[6] },{ name: "虚构血管女", color: COLORS[1] }],
    turns: [
      { pid: 0, text: "玫瑰其实是蓝色的。我查过了。" },
      { pid: 1, text: "紫罗兰嘛，说实话一直是那种灰不拉几的白。" },
      { pid: 0, text: "糖是咸的。这个大家都知道。" },
    ],
    currentTurn: null, round: 2, roundLimit: null,
  },
  {
    id: 4, title: "电梯里的尬聊", catKey: "freewriting", status: "completed", mode: "structured",
    participants: [{ name: "魔法飞行兽", color: COLORS[2] },{ name: "死亡碳基体", color: COLORS[0] },{ name: "无聊病娇酱", color: COLORS[7] }],
    turns: [
      { pid: 0, text: "今天天气不错啊，我对那个明显是鬼的男人说。" },
      { pid: 1, text: "他点了点头。鬼都挺有礼貌的。" },
      { pid: 2, text: "电梯一直往上走。我们都假装这很正常。" },
      { pid: 0, text: "我问他去几楼。他说他也不知道。" },
      { pid: 1, text: "我说我也是。我们达成了某种共识。" },
      { pid: 2, text: "门开了。外面什么都没有。我们又关上了门。" },
    ],
    currentTurn: null, round: 2, roundLimit: 2,
    reactions: { "✦": 7, "◎": 2, "∿": 0, "⌖": 4 },
  },
];
