"""Built-in question bank. Format: category|difficulty|question|accepted;answers|explanation"""
import random

STRICT = """
logical|easy|If all bloops are razzies and all razzies are lazzies, are all bloops definitely lazzies?|yes|Chain of "all" statements is transitive.
logical|easy|A is taller than B, and B is taller than C. Who is the shortest?|c|Order: A > B > C.
logical|easy|Can a statement be both true and false at the same time in classical logic?|no;never;cannot|Law of non-contradiction.
logical|easy|If some cats are black and all black things absorb light, must some cats absorb light?|yes|Those black cats are black things.
logical|medium|What comes next: 2, 6, 12, 20, 30, ?|42|Differences grow by 2 (n×(n+1)).
logical|medium|If 5 machines make 5 widgets in 5 minutes, how many minutes do 100 machines need for 100 widgets?|5|Each machine makes one widget per 5 minutes.
logical|medium|If today is Wednesday, what day is it 100 days from now?|friday|100 mod 7 = 2, so two days after Wednesday.
logical|hard|Three switches are outside a closed room with one bulb inside. You may enter once. How do you find the right switch?|warm;hot;heat|Run one switch for a while, switch it off, turn on another, then enter: lit = second, warm = first.
logical|hard|With a 3L and a 5L jug, how can you measure exactly 4 litres?|fill;pour|Fill 5L, pour into 3L, empty 3L, move the remaining 2L over, refill 5L, top up 3L: 4L remain.
tricky|easy|How many months have 28 days?|12;twelve;all|Every month has at least 28 days.
tricky|easy|A farmer has 17 sheep and all but 9 run away. How many are left?|9;nine|"All but 9" means 9 stay.
tricky|easy|Which weighs more: a kilogram of feathers or a kilogram of steel?|same;equal;neither|Both are one kilogram.
tricky|easy|You have one match and enter a dark room with a candle, an oil lamp and a fireplace. What do you light first?|match|Nothing lights without the match.
tricky|medium|How many animals of each kind did Moses take on the Ark?|none;zero;0;noah|It was Noah, not Moses.
tricky|medium|A plane crashes on the border of two countries. Where are the survivors buried?|not;nowhere;survivors|You don't bury survivors.
tricky|medium|Before Mount Everest was discovered, what was the tallest mountain on Earth?|everest|It was already the tallest.
tricky|medium|A doctor gives you three pills, one every 30 minutes. How long do they last?|60;hour|Take at 0, 30 and 60 minutes: one hour.
tricky|hard|What can you hold in your left hand but never in your right hand?|right hand;right elbow;elbow|Your own right hand or elbow.
brain|easy|What has keys but can't open locks?|piano;keyboard|Piano or keyboard.
brain|easy|I speak without a mouth and hear without ears. What am I?|echo|An echo.
brain|easy|The more you take, the more you leave behind. What are they?|footstep;steps|Footsteps.
brain|easy|What gets wetter the more it dries?|towel|A towel.
brain|easy|What has a head and a tail but no body?|coin|A coin.
brain|medium|What can travel around the world while staying in a corner?|stamp|A postage stamp.
brain|medium|What is always in front of you but can't be seen?|future|The future.
brain|hard|What begins with T, ends with T, and has T in it?|teapot|Tea-pot: T, tea, T.
brain|hard|Forward I'm heavy, backward I'm not. What am I?|ton|"Ton" reversed is "not".
math|easy|What is 15% of 240?|36|0.15 × 240 = 36.
math|easy|Two angles of a triangle are 50° and 60°. What is the third?|70|Angles sum to 180°.
math|medium|What is the next prime number after 31?|37|32-36 are all composite.
math|medium|What is the sum of all whole numbers from 1 to 100?|5050|n(n+1)/2 = 5050.
math|hard|How many zeros are at the end of 10 factorial?|2;two|10! = 3,628,800.
science|easy|Which gas do plants absorb from the air for photosynthesis?|carbon dioxide;co2|Plants turn CO2 and water into sugar.
science|easy|What is the chemical symbol for gold?|au|From Latin "aurum".
science|easy|What force keeps the planets in orbit around the Sun?|gravity|Gravity.
science|easy|What is the hardest natural substance on Earth?|diamond|Diamond.
science|medium|Why is the sky blue during the day?|scatter|Rayleigh scattering: air scatters short blue wavelengths most.
science|medium|How many hearts does an octopus have?|3;three|Two branchial hearts and one systemic heart.
science|medium|What is the most abundant gas in Earth's atmosphere?|nitrogen|About 78% nitrogen.
science|medium|Roughly how fast is light in km per second?|300000;299792|About 299,792 km/s.
science|hard|Why can't sound travel through space?|vacuum;no air;no medium;particles|Sound needs a medium to vibrate.
general|easy|What is the capital of Australia?|canberra|Not Sydney!
general|easy|Who painted the Mona Lisa?|leonardo;da vinci|Leonardo da Vinci.
general|easy|Which holy river flows through Patna?|ganga;ganges|The Ganga.
general|easy|Which is the largest ocean on Earth?|pacific|The Pacific.
general|easy|How many continents are there?|7;seven|By the common convention.
general|medium|Which language has the most native speakers?|mandarin;chinese|Mandarin Chinese.
general|medium|In which year did humans first land on the Moon?|1969|Apollo 11.
general|medium|What is the smallest country in the world by area?|vatican|Vatican City.
general|easy|Which country gifted the Statue of Liberty to the USA?|france|France, 1886.
"""

OPEN = {
"illogical": """How many sides does a circle have when it's angry?
What colour is the smell of Tuesday?
If a clock eats time, does it get fat on Mondays?
Which weighs more: the sound of a door or the idea of cheese?
Why did the square refuse to become a triangle at midnight?
How loud is the colour purple?
If silence had a flavour, which spice would it be?
Can a Wednesday be taller than a Thursday?
What is the airspeed velocity of an unladen opinion?""",
"funny": """What would your pet text you if it could?
Invent a useless superpower and describe its worst possible use.
What's the worst possible name for a pizza place?
Why did the chicken REALLY cross the road?
What would a pigeon's LinkedIn headline be?
If vegetables had a boy band, who would be the lead singer?
What would aliens write in their review of Earth?
Pitch the most pointless app ever made.""",
"philosophy": """If you replace every plank of a ship, is it still the same ship?
Is it better to be a happy fool or an unhappy genius?
If nobody remembers you, did your life matter?
Can you step into the same river twice?
Is free will an illusion if the universe is deterministic?
Does a tree falling in an empty forest make a sound?
Is a lie told to protect someone always wrong?
Would you take a pill that makes you content forever but never curious?""",
"weird": """What would happen if gravity took a 10-second break?
If you could rename one day of the week, what would you call it?
What does a cloud think about all day?
If your shadow quit, what would its resignation letter say?
Which household object secretly runs the house?
What's the first thing you'd do if you woke up as a giraffe?
How would you explain the internet to a medieval knight?
If dreams were currency, what could you buy?""",
"imagination": """Describe a city built on a giant turtle's back.
Invent a colour nobody has seen. What does it feel like?
You can add one month to the calendar. What happens in it?
Describe the sound of a planet waking up.
What would a library of lost things contain?
You meet your future self for 60 seconds. What do you ask?
Invent a holiday for people who love Mondays.
What would school be like on Mars?""",
"impossible": """What is the largest number? Name it.
What is the last digit of pi?
Describe a square circle using only words.
What existed before time began?
Can an all-powerful being create a rock it cannot lift?
What is north of the North Pole?
Count to infinity. Which number did you stop at?
Describe a colour that does not exist.""",
}


def _generated_math(target=110):
    r, seen = random.Random(7), {}
    while len(seen) < target:
        k = r.choice("mul add pct seq sq rem".split())
        if k == "mul":
            a, b = r.randint(6, 19), r.randint(3, 14); t, ans, d = f"What is {a} × {b}?", a * b, "easy"
        elif k == "add":
            a, b = r.randint(120, 899), r.randint(120, 899); t, ans, d = f"What is {a} + {b}?", a + b, "easy"
        elif k == "pct":
            p, n = r.choice([5, 10, 15, 20, 25, 40, 60, 75]), r.choice([80, 120, 160, 240, 360, 480])
            t, ans, d = f"What is {p}% of {n}?", p * n // 100, "medium"
        elif k == "seq":
            s, st = r.randint(1, 20), r.randint(2, 9)
            t, ans, d = f"What comes next: {', '.join(str(s + st * i) for i in range(4))}, ?", s + 4 * st, "easy"
        elif k == "sq":
            n = r.randint(12, 45); t, ans, d = f"What is {n} squared?", n * n, "medium"
        else:
            n, m = r.randint(100, 999), r.randint(7, 19); t, ans, d = f"What is the remainder when {n} is divided by {m}?", n % m, "hard"
        seen.setdefault(t, ("math", d, t, str(ans), f"The answer is {ans}."))
    return list(seen.values())


def all_questions():
    out = []
    for line in STRICT.strip().splitlines():
        c, d, t, a, e = line.split("|")
        out.append((c, d, t, a, e))
    cycle = ["easy", "medium", "hard"]
    for cat, block in OPEN.items():
        for i, t in enumerate(block.strip().splitlines()):
            out.append((cat, "impossible" if cat == "impossible" else cycle[i % 3], t, "", ""))
    return out + _generated_math()
