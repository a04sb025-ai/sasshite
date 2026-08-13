import { useId, useState } from 'react'

type SceneState = 'before' | 'lap' | 'floor'

const states: { id: SceneState; label: string; hint: string }[] = [
  { id: 'before', label: 'BEFORE', hint: '席をふさいでいるバッグ' },
  { id: 'lap', label: 'AFTER · LAP', hint: '膝に抱えて席を譲る' },
  { id: 'floor', label: 'AFTER · FLOOR', hint: '足元に寄せて席を譲る' },
]

export function TrainSvgPrototype() {
  const [scene, setScene] = useState<SceneState>('before')
  const [debugSkeleton, setDebugSkeleton] = useState(false)
  const uid = useId().replace(/:/g, '')
  const seated = scene !== 'before'
  const bagTransform = scene === 'before' ? 'translate(498 846)' : scene === 'lap' ? 'translate(286 873) rotate(-4)' : 'translate(188 1258) rotate(2)'

  return <main className="prototype-shell">
    <header className="prototype-header">
      <p className="prototype-kicker">TRAIN · SVG ART STUDY</p>
      <h1>察して。</h1>
      <p>言葉にされない、小さな余白。</p>
    </header>

    <section className="scene-card" aria-label={states.find((item) => item.id === scene)?.hint}>
      <svg className="train-scene" viewBox="0 0 1024 1536" role="img" aria-labelledby={`${uid}-title ${uid}-desc`}>
        <title id={`${uid}-title`}>電車で隣の席に置いたバッグを移動する場面</title>
        <desc id={`${uid}-desc`}>{states.find((item) => item.id === scene)?.hint}。左にプレイヤー、右に同じ乗客がいます。</desc>
        <defs>
          <linearGradient id={`${uid}-wall`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#eef0e8"/><stop offset="1" stopColor="#d7d9ce"/></linearGradient>
          <linearGradient id={`${uid}-window`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#b8d8d7"/><stop offset=".55" stopColor="#dce8dd"/><stop offset="1" stopColor="#8cb7b7"/></linearGradient>
          <linearGradient id={`${uid}-seat`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#71918a"/><stop offset=".52" stopColor="#536f6b"/><stop offset="1" stopColor="#405b58"/></linearGradient>
          <linearGradient id={`${uid}-orange`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e98745"/><stop offset="1" stopColor="#bd5937"/></linearGradient>
          <linearGradient id={`${uid}-coat`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#738594"/><stop offset="1" stopColor="#4f6471"/></linearGradient>
          <linearGradient id={`${uid}-bag`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#a7653d"/><stop offset="1" stopColor="#704128"/></linearGradient>
          <filter id={`${uid}-shadow`} x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#273b39" floodOpacity=".2"/></filter>
          <clipPath id={`${uid}-window-clip`}><path d="M111 218 Q111 190 139 190 H668 Q696 190 696 218 V600 H111Z"/></clipPath>
        </defs>

        <g id="background">
          <path fill={`url(#${uid}-wall)`} d="M0 0H1024V1288H0Z"/>
          <path fill="#273f42" d="M0 0H1024V102H0Z"/>
          <path fill="#49615f" d="M0 102H1024V132H0Z" opacity=".7"/>
          <g id="window">
            <path fill="#425a5b" d="M80 180Q80 155 108 155H722Q748 155 748 182V640H80Z"/>
            <path fill={`url(#${uid}-window)`} d="M111 218Q111 190 139 190H668Q696 190 696 218V600H111Z"/>
            <g clipPath={`url(#${uid}-window-clip)`} opacity=".46">
              <path fill="#f6f0cf" d="M90 415Q250 341 411 394T725 349V620H90Z"/>
              <path fill="#789c91" d="M65 519Q203 430 350 516T746 436V640H65Z"/>
              <path fill="#fff" d="M168 170h62L96 605H40zm284 0h30L350 605h-43z" opacity=".32"/>
            </g>
            <path fill="none" stroke="#78908d" strokeWidth="18" d="M415 193V605"/>
            <path fill="none" stroke="#f7f3e8" strokeWidth="8" d="M118 600H698" opacity=".72"/>
          </g>
          <g id="door">
            <path fill="#c9cdc6" stroke="#71817e" strokeWidth="10" d="M770 174H1024V961H770Z"/>
            <path fill="#b3c7c3" stroke="#71817e" strokeWidth="8" d="M802 224H992V602H802Z"/>
            <path fill="#819f9d" d="M822 246H972V579H822Z" opacity=".55"/>
            <path fill="#657876" d="M798 678h18v128h-18z"/>
          </g>
          <g id="rail" fill="none" strokeLinecap="round">
            <path stroke="#586c69" strokeWidth="22" d="M22 147H1000"/>
            <path stroke="#83918c" strokeWidth="9" d="M72 151V364M326 151V336M591 151V348M850 151V335"/>
            <g fill="#f5eee0" stroke="#697976" strokeWidth="9">
              <path d="M25 350Q70 308 118 350L105 426Q69 448 37 426Z"/>
              <path d="M280 326Q326 284 372 326L359 401Q326 423 292 401Z"/>
              <path d="M544 337Q591 294 638 337L624 414Q591 435 557 414Z"/>
              <path d="M803 325Q850 283 896 325L883 402Q850 423 816 402Z"/>
            </g>
          </g>
          <g id="bench" filter={`url(#${uid}-shadow)`}>
            <path fill="#374d4b" d="M52 659Q52 624 88 620H828Q866 622 866 660V1029H52Z"/>
            <path fill={`url(#${uid}-seat)`} d="M70 676Q70 645 101 645H818Q846 645 846 676V908H70Z"/>
            <path fill="#87a49b" d="M83 675Q83 661 101 661H817Q832 661 832 677V700H83Z" opacity=".62"/>
            <path fill="#476460" d="M59 915Q59 887 91 887H842Q876 889 876 920L842 1027H86Z"/>
            <path fill="#6e8d86" d="M77 910Q77 898 96 898H838Q856 898 856 913L841 970H89Z"/>
            <path fill="none" stroke="#aec0b7" strokeWidth="8" d="M320 655V895M584 655V895" opacity=".48"/>
            <path fill="#304644" d="M86 1011h42v165H86zm704 0h42v165h-42z"/>
          </g>
          <path fill="#b8b6a8" d="M0 1110H1024V1536H0Z"/>
          <path fill="#d6d2c2" d="M0 1120Q508 1087 1024 1120V1192Q509 1163 0 1197Z"/>
          <path fill="#8d8d82" d="M0 1097H1024V1128H0Z"/>
          <path fill="none" stroke="#a6a397" strokeWidth="7" d="M0 1361Q512 1309 1024 1361" opacity=".55"/>
          <ellipse cx="442" cy="1386" rx="325" ry="48" fill="#394c49" opacity=".13"/>
        </g>

        <g id="player" stroke="#493b35" strokeLinecap="round" strokeLinejoin="round">
          {/* z-order: shadow → rear leg/arm → pelvis/torso → front leg/arm → neck → head */}
          <ellipse id="player-shadow" cx="302" cy="1248" rx="184" ry="30" fill="#2f423f" stroke="none" opacity=".18"/>
          <g id="player-right-leg" aria-label="rear right leg" transform="translate(28 0)">
            <g id="player-right-thigh"><path fill="#424f58" strokeWidth="9" d="M267 969Q293 948 329 954L424 1001Q454 1018 450 1050Q446 1078 415 1081L318 1048Q286 1042 264 1021Z"/></g>
            <g id="player-right-lower-leg"><path fill="#4f5e66" strokeWidth="9" d="M413 1040Q438 1038 452 1058L456 1186Q453 1213 425 1216L396 1211Q384 1205 388 1185L390 1070Z"/></g>
            <g id="player-right-foot"><path fill="#40342f" strokeWidth="8" d="M391 1182Q425 1173 457 1190L499 1218Q510 1238 485 1248L397 1247Q376 1244 378 1225Z"/><path fill="#d6c8ad" stroke="none" d="M384 1228Q435 1236 497 1225L495 1240H383Z"/></g>
          </g>
          <g id="player-right-arm" fill={`url(#${uid}-orange)`} strokeWidth="10">
            <g id="player-right-upper-arm"><path d="M340 773Q373 778 387 809L396 902Q397 928 372 935L352 923L337 816Z"/></g>
            <g id="player-right-forearm"><path d={scene === 'lap' ? 'M379 893Q398 892 407 914L380 1009Q373 1031 349 1025L333 1011L357 918Z' : 'M378 897Q397 901 397 924L365 1001Q356 1020 335 1011L322 995L354 916Z'}/></g>
            <g id="player-right-hand"><path fill="#f1d5b5" d={scene === 'lap' ? 'M342 997Q363 986 381 1004L379 1035Q358 1052 338 1034Z' : 'M324 982Q346 973 363 993L358 1019Q337 1034 321 1014Z'}/></g>
          </g>
          <g id="player-pelvis"><path fill="#3f4b54" strokeWidth="9" d="M184 932Q246 910 338 930L363 992Q333 1025 273 1033Q215 1034 177 999Z"/></g>
          <g id="player-torso">
            <path fill={`url(#${uid}-orange)`} strokeWidth="11" d="M171 758Q208 730 272 730Q335 731 365 775L374 944Q337 976 276 981Q211 981 169 950L146 825Q143 784 171 758Z"/>
            <path fill="#f2b466" stroke="none" d="M176 782Q204 754 239 752L220 957Q190 951 174 936L158 825Q155 798 176 782Z" opacity=".42"/>
            <path fill="none" stroke="#8d4533" strokeWidth="6" d="M272 759V960" opacity=".65"/>
            <path fill="#fff0da" strokeWidth="6" d="M224 752L270 779L316 750L302 810H242Z"/>
          </g>
          <g id="player-left-leg" aria-label="front left leg">
            <g id="player-left-thigh"><path fill="#56636b" strokeWidth="9" d="M194 973Q224 951 262 960L373 1011Q404 1026 400 1058Q395 1087 362 1090L244 1052Q209 1046 185 1022Z"/></g>
            <g id="player-left-lower-leg"><path fill="#647078" strokeWidth="9" d="M363 1049Q390 1044 405 1066L401 1195Q396 1222 367 1223L338 1217Q325 1209 331 1189L338 1076Z"/></g>
            <g id="player-left-foot"><path fill="#4a3930" strokeWidth="8" d="M335 1188Q368 1179 401 1197L439 1227Q448 1248 422 1257H333Q311 1253 315 1234Z"/><path fill="#e0d0b6" stroke="none" d="M320 1237Q370 1245 437 1234L433 1249H319Z"/></g>
          </g>
          <g id="player-left-arm" fill={`url(#${uid}-orange)`} strokeWidth="10">
            <g id="player-left-upper-arm"><path d="M174 779Q140 794 143 834L166 927Q172 950 197 947L216 931L205 810Z"/></g>
            <g id="player-left-forearm"><path d={scene === 'lap' ? 'M178 914Q196 903 213 919L271 1001Q282 1021 261 1037L243 1038L183 953Z' : 'M178 914Q197 906 212 924L250 997Q258 1018 237 1028L219 1022L178 948Z'}/></g>
            <g id="player-left-hand"><path fill="#f1d5b5" d={scene === 'lap' ? 'M245 1000Q267 990 284 1010L283 1038Q260 1055 242 1035Z' : 'M220 992Q243 982 258 1004L253 1031Q231 1044 216 1024Z'}/></g>
          </g>
          <g id="player-neck"><path fill="#e7c49f" strokeWidth="7" d="M235 700L237 766Q269 790 304 763L304 695Z"/></g>
          <g id="player-head">
            <path fill="#f1d5b5" strokeWidth="10" d="M180 592Q197 528 267 515Q330 509 363 557Q385 591 373 653Q364 705 317 731Q270 754 223 728Q175 701 169 649Q166 618 180 592Z"/>
            <path fill="#4e3a32" strokeWidth="9" d="M178 615Q161 563 202 525Q244 485 307 506Q361 520 378 568Q348 553 320 559Q286 570 254 554Q226 586 178 615Z"/>
            <path fill="none" stroke="#4e3a32" strokeWidth="15" d="M177 603Q168 650 190 682"/>
            <g id="player-face" fill="none" strokeWidth="6"><path d="M228 627q12-8 24 1m53-3q12-7 23 2"/><path strokeWidth="8" d="M241 640h1m76-1h1"/><path stroke="#b77c6a" strokeWidth="5" d="M275 665q11 9 24-1"/></g>
          </g>
          {debugSkeleton && <g className="skeleton-joints" aria-label="Player skeleton joints"><circle cx="185" cy="790" r="10"/><circle cx="360" cy="790" r="10"/><circle cx="188" cy="924" r="9"/><circle cx="378" cy="912" r="9"/><circle cx="220" cy="975" r="10"/><circle cx="302" cy="972" r="10"/><circle cx="370" cy="1058" r="9"/><circle cx="426" cy="1052" r="9"/><circle cx="368" cy="1203" r="8"/><circle cx="428" cy="1197" r="8"/></g>}
        </g>

        <g id="npc" stroke="#3d4242" strokeLinecap="round" strokeLinejoin="round">
          {seated ? <g id="npc-seated">
            {/* z-order: rear leg/arm → pelvis/torso → front leg/arm → neck → head */}
            <ellipse cx="710" cy="1250" rx="177" ry="28" fill="#2f423f" stroke="none" opacity=".16"/>
            <g id="npc-right-leg">
              <g id="npc-right-thigh"><path fill="#4c5c64" strokeWidth="9" d="M672 963Q704 947 738 958L818 1000Q843 1015 840 1045Q836 1071 808 1075L719 1046Q689 1042 669 1023Z"/></g>
              <g id="npc-right-lower-leg"><path fill="#596a71" strokeWidth="9" d="M806 1038Q831 1035 844 1057L849 1187Q844 1214 817 1215L791 1209Q780 1202 784 1183L784 1067Z"/></g>
              <g id="npc-right-foot"><path fill="#343e40" strokeWidth="8" d="M785 1182Q817 1175 849 1193L884 1221Q892 1241 868 1249H786Q765 1245 769 1227Z"/></g>
            </g>
            <g id="npc-right-arm" fill={`url(#${uid}-coat)`} strokeWidth="10"><g id="npc-right-upper-arm"><path d="M755 760Q786 768 796 802L798 901Q796 925 772 930L753 916L746 800Z"/></g><g id="npc-right-forearm"><path d="M779 895Q799 893 808 914L790 1001Q783 1022 761 1017L746 1001L760 920Z"/></g><g id="npc-right-hand"><path fill="#e5c5a7" d="M751 990Q773 979 791 999L790 1027Q767 1043 750 1024Z"/></g></g>
            <g id="npc-pelvis"><path fill="#475760" strokeWidth="9" d="M593 932Q657 910 759 934L784 991Q750 1022 684 1028Q623 1027 587 997Z"/></g>
            <g id="npc-torso"><path fill={`url(#${uid}-coat)`} strokeWidth="11" d="M587 738Q624 708 684 710Q744 711 775 753L784 946Q746 976 684 979Q621 978 580 949L562 807Q559 766 587 738Z"/><path fill="#dce4df" strokeWidth="6" d="M637 724L682 755L727 723L716 791H648Z"/></g>
            <g id="npc-left-leg">
              <g id="npc-left-thigh"><path fill="#5c6d75" strokeWidth="9" d="M602 966Q633 946 670 956L766 1007Q793 1023 789 1054Q784 1081 753 1085L648 1048Q616 1044 594 1022Z"/></g>
              <g id="npc-left-lower-leg"><path fill="#6a7980" strokeWidth="9" d="M752 1046Q778 1041 793 1063L789 1195Q784 1221 756 1222L729 1217Q716 1209 722 1189L728 1074Z"/></g>
              <g id="npc-left-foot"><path fill="#3b4648" strokeWidth="8" d="M726 1187Q758 1178 790 1197L824 1226Q833 1247 808 1255H725Q704 1251 708 1233Z"/></g>
            </g>
            <g id="npc-left-arm" fill={`url(#${uid}-coat)`} strokeWidth="10"><g id="npc-left-upper-arm"><path d="M589 760Q555 777 558 819L575 915Q580 939 605 938L624 921L620 790Z"/></g><g id="npc-left-forearm"><path d="M586 903Q606 895 621 914L651 998Q658 1019 637 1029L620 1021L582 936Z"/></g><g id="npc-left-hand"><path fill="#e5c5a7" d="M619 994Q641 984 658 1005L654 1032Q632 1047 616 1027Z"/></g></g>
            <g id="npc-neck"><path fill="#d7b594" strokeWidth="7" d="M643 681L645 745Q676 770 708 742L708 677Z"/></g>
            <g id="npc-head" transform="translate(-55 -4)"><path fill="#e5c5a7" strokeWidth="10" d="M647 518Q661 458 722 438Q786 424 828 466Q862 499 854 559Q849 613 807 644Q764 675 715 655Q665 636 649 588Q640 554 647 518Z"/><path fill="#434a4b" strokeWidth="9" d="M649 536Q636 482 679 447Q726 408 786 434Q827 451 850 493Q814 472 785 486Q745 510 707 481Q688 522 649 536Z"/><g id="npc-face" fill="none" strokeWidth="6"><path d="M697 548q12-8 25 0m53-5q12-7 24 0"/><path strokeWidth="8" d="M710 561h1m77-3h1"/><path stroke="#9f7465" strokeWidth="5" d="M741 590q12 6 24-3"/></g></g>
            {debugSkeleton && <g className="skeleton-joints"><circle cx="600" cy="775" r="10"/><circle cx="772" cy="775" r="10"/><circle cx="596" cy="915" r="9"/><circle cx="784" cy="910" r="9"/><circle cx="630" cy="970" r="10"/><circle cx="714" cy="970" r="10"/><circle cx="758" cy="1058" r="9"/><circle cx="817" cy="1050" r="9"/><circle cx="758" cy="1203" r="8"/><circle cx="817" cy="1198" r="8"/></g>}
          </g> : <g id="npc-standing">
            <ellipse cx="744" cy="1374" rx="143" ry="30" fill="#2f423f" stroke="none" opacity=".16"/>
            <g id="npc-right-leg"><g id="npc-right-thigh"><path fill="#4e5e66" strokeWidth="9" d="M724 929Q755 916 786 929L807 1091Q796 1117 765 1118Q741 1112 737 1089Z"/></g><g id="npc-right-lower-leg"><path fill="#596a71" strokeWidth="9" d="M766 1095Q793 1088 810 1107L827 1306Q819 1332 789 1331L765 1319Z"/></g><g id="npc-right-foot"><path fill="#343e40" strokeWidth="8" d="M766 1304Q797 1297 827 1316L860 1345Q866 1365 842 1372H762Q741 1367 747 1347Z"/></g></g>
            <g id="npc-right-arm" fill={`url(#${uid}-coat)`} strokeWidth="10"><g id="npc-right-upper-arm"><path d="M802 744Q832 758 836 797L844 927Q843 950 819 954L800 938L782 774Z"/></g><g id="npc-right-forearm"><path d="M825 918Q846 918 852 941L856 1003Q853 1026 831 1027L814 1012L810 944Z"/></g><g id="npc-right-hand"><path fill="#e5c5a7" d="M817 1000Q839 989 857 1009L856 1037Q833 1053 816 1034Z"/></g></g>
            <g id="npc-pelvis"><path fill="#475760" strokeWidth="9" d="M651 913Q713 894 800 917L813 968Q775 994 725 992Q680 991 647 966Z"/></g>
            <g id="npc-torso"><path fill={`url(#${uid}-coat)`} strokeWidth="11" d="M639 716Q677 686 735 691Q791 694 817 739L824 925Q788 953 730 958Q673 956 634 929L614 781Q611 744 639 716Z"/><path fill="#dce4df" strokeWidth="6" d="M688 701L732 733L775 700L765 770H700Z"/></g>
            <g id="npc-left-leg"><g id="npc-left-thigh"><path fill="#607078" strokeWidth="9" d="M656 929Q686 916 718 929L730 1092Q717 1118 686 1115Q662 1108 660 1085Z"/></g><g id="npc-left-lower-leg"><path fill="#6b7980" strokeWidth="9" d="M686 1092Q713 1086 730 1105L724 1305Q714 1330 684 1326L661 1314Z"/></g><g id="npc-left-foot"><path fill="#3b4648" strokeWidth="8" d="M660 1301Q692 1294 724 1312L752 1341Q758 1361 734 1368H650Q631 1362 637 1342Z"/></g></g>
            <g id="npc-left-arm" fill={`url(#${uid}-coat)`} strokeWidth="10"><g id="npc-left-upper-arm"><path d="M637 740Q604 755 606 797L616 929Q620 953 645 954L663 937L666 770Z"/></g><g id="npc-left-forearm"><path d="M628 918Q648 916 658 938L658 1003Q654 1026 632 1027L615 1011L611 944Z"/></g><g id="npc-left-hand"><path fill="#e5c5a7" d="M617 1000Q639 989 657 1009L656 1037Q633 1053 616 1034Z"/></g></g>
            <g id="npc-neck"><path fill="#d7b594" strokeWidth="7" d="M695 650L697 717Q727 742 758 714L758 646Z"/></g>
            <g id="npc-head"><path fill="#e5c5a7" strokeWidth="10" d="M647 518Q661 458 722 438Q786 424 828 466Q862 499 854 559Q849 613 807 644Q764 675 715 655Q665 636 649 588Q640 554 647 518Z"/><path fill="#434a4b" strokeWidth="9" d="M649 536Q636 482 679 447Q726 408 786 434Q827 451 850 493Q814 472 785 486Q745 510 707 481Q688 522 649 536Z"/><g id="npc-face" fill="none" strokeWidth="6"><path d="M697 548q12-8 25 0m53-5q12-7 24 0"/><path strokeWidth="8" d="M710 561h1m77-3h1"/><path stroke="#9f7465" strokeWidth="5" d="M741 590q12 6 24-3"/></g></g>
            {debugSkeleton && <g className="skeleton-joints"><circle cx="650" cy="760" r="10"/><circle cx="803" cy="760" r="10"/><circle cx="638" cy="935" r="9"/><circle cx="830" cy="937" r="9"/><circle cx="687" cy="947" r="10"/><circle cx="769" cy="947" r="10"/><circle cx="705" cy="1104" r="9"/><circle cx="787" cy="1104" r="9"/><circle cx="694" cy="1313" r="8"/><circle cx="797" cy="1316" r="8"/></g>}
          </g>}
        </g>

        <g id="bag" transform={bagTransform} filter={`url(#${uid}-shadow)`} stroke="#4d3528" strokeLinecap="round" strokeLinejoin="round">
          <path fill="none" strokeWidth="15" d="M78 54Q87 2 148 2H192Q250 4 257 59"/>
          <path fill="none" stroke="#c3885c" strokeWidth="5" d="M93 54Q103 21 149 20H190Q232 22 242 59" opacity=".8"/>
          <path fill={`url(#${uid}-bag)`} strokeWidth="10" d="M31 62Q35 43 57 42H278Q300 43 306 67L322 213Q318 245 285 254Q167 270 46 249Q17 240 18 211Z"/>
          <path fill="#bd7a4e" strokeWidth="7" d="M24 87Q167 120 312 84L302 159Q171 190 25 154Z"/>
          <path fill="#e0a064" strokeWidth="6" d="M141 154Q169 148 194 154L191 196Q167 210 143 196Z"/>
          <path fill="#6a432c" stroke="none" d="M154 165H181V187H154Z"/>
          <path fill="none" stroke="#d59a6f" strokeWidth="5" d="M45 213Q164 236 293 211" opacity=".55"/>
          <path fill="#5b3928" stroke="none" d="M53 245h47v13H53zm184 2h45v12h-45z"/>
        </g>
      </svg>
      <div className="scene-caption" aria-live="polite">
        <span>{scene === 'before' ? 'まだ、ひと席ぶんの距離。' : 'ひと席ぶん、空気がやわらいだ。'}</span>
      </div>
    </section>

    <nav className="state-switcher" aria-label="場面の状態を切り替える">
      {states.map((item) => <button key={item.id} type="button" className={scene === item.id ? 'is-active' : ''} aria-pressed={scene === item.id} onClick={() => setScene(item.id)}>
        <strong>{item.label}</strong><span>{item.hint}</span>
      </button>)}
    </nav>
    <button className="debug-toggle" type="button" aria-pressed={debugSkeleton} onClick={() => setDebugSkeleton((value) => !value)}>
      DEBUG SKELETON {debugSkeleton ? 'ON' : 'OFF'}
    </button>
  </main>
}
