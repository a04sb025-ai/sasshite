import { useId, useState } from 'react'

type SceneState = 'before' | 'lap' | 'floor'

const states: { id: SceneState; label: string; hint: string }[] = [
  { id: 'before', label: 'BEFORE', hint: '席をふさいでいるバッグ' },
  { id: 'lap', label: 'AFTER · LAP', hint: '膝に抱えて席を譲る' },
  { id: 'floor', label: 'AFTER · FLOOR', hint: '足元に寄せて席を譲る' },
]

export function TrainSvgPrototype() {
  const [scene, setScene] = useState<SceneState>('before')
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
          <g id="player-shadow" fill="#2f423f" stroke="none" opacity=".18"><ellipse cx="287" cy="1197" rx="185" ry="32"/></g>
          <g id="player-lower-body">
            <g id="player-thigh" fill="#48545d" strokeWidth="9"><path d="M230 976Q285 954 345 981L474 1050Q496 1076 470 1110Q452 1131 419 1117L298 1065Q248 1058 217 1036Z"/></g>
            <g id="player-lower-leg" fill="#59656d" strokeWidth="9"><path d="M421 1081Q453 1066 479 1088L453 1190Q445 1213 416 1210L386 1204Q374 1197 383 1175Z"/></g>
            <g id="player-shoe" fill="#4a3930" strokeWidth="8"><path d="M378 1180Q410 1174 453 1192L490 1220Q501 1241 474 1250H373Q351 1246 355 1227Z"/><path fill="#d6c8ad" stroke="none" d="M365 1222Q423 1231 486 1224L482 1239H362Z"/></g>
          </g>
          <g id="player-torso">
            <path fill={`url(#${uid}-orange)`} strokeWidth="11" d="M171 759Q210 728 273 731Q337 732 370 780L388 975Q356 1021 286 1026Q211 1028 166 991L145 833Q143 786 171 759Z"/>
            <path fill="#f2b466" stroke="none" d="M178 783Q210 755 245 756L222 992Q188 984 171 965L157 833Q156 801 178 783Z" opacity=".46"/>
            <path fill="none" stroke="#8d4533" strokeWidth="6" d="M273 753V1007M277 855h20" opacity=".7"/>
            <path fill="#f1d5b5" strokeWidth="7" d="M238 716L240 755Q270 781 302 750L300 704Z"/>
          </g>
          <g id="player-head">
            <path fill="#f1d5b5" strokeWidth="10" d="M180 592Q197 528 267 515Q330 509 363 557Q385 591 373 653Q364 705 317 731Q270 754 223 728Q175 701 169 649Q166 618 180 592Z"/>
            <path id="player-hair" fill="#4e3a32" strokeWidth="9" d="M178 615Q161 563 202 525Q244 485 307 506Q361 520 378 568Q348 553 320 559Q286 570 254 554Q226 586 178 615Z"/>
            <path fill="none" stroke="#4e3a32" strokeWidth="15" d="M177 603Q168 650 190 682"/>
            <g id="player-face" fill="none" strokeWidth="6">
              <path d="M228 627q12-8 24 1m53-3q12-7 23 2"/>
              <path strokeWidth="8" d="M241 640h1m76-1h1"/>
              <path stroke="#b77c6a" strokeWidth="5" d="M275 665q11 9 24-1"/>
              <path stroke="#d3947f" strokeWidth="7" d="M211 664h13m104-2h12" opacity=".55"/>
            </g>
          </g>
          <g id="player-arms" fill={`url(#${uid}-orange)`} strokeWidth="10">
            {scene === 'lap' ? <>
              <g id="player-upper-arm"><path d="M175 789Q139 806 143 851L178 951Q190 976 218 962L232 946L206 822Z"/><path d="M346 784Q380 789 393 829L407 931Q409 956 382 964L363 950L351 835Z"/></g>
              <g id="player-forearm"><path d="M185 929Q202 915 222 935L283 1003L251 1038Q217 1007 181 967Q170 948 185 929Z"/><path d="M391 919Q372 911 358 934L319 1008L356 1033Q383 996 406 955Q414 932 391 919Z"/></g>
              <g id="player-hand" fill="#f1d5b5"><path d="M246 1016q25-25 52-4l13 19q-26 24-57 8Z"/><path d="M310 1024q18-27 48-10l10 21q-23 21-52 9Z"/></g>
            </> : <>
              <g id="player-upper-arm"><path d="M174 790Q139 814 148 866L184 958Q195 979 220 964L234 947L208 818Z"/><path d="M351 789Q379 803 380 844L369 926Q364 951 341 945L327 927L335 817Z"/></g>
              <g id="player-forearm"><path d="M188 937Q210 923 227 947L266 1012L230 1034Q196 1001 179 967Q175 949 188 937Z"/><path d="M359 916Q339 907 326 929L303 989L340 1007Q364 975 374 945Q375 926 359 916Z"/></g>
              <g id="player-hand" fill="#f1d5b5"><path d="M226 1011q25-22 48 2l5 19q-29 19-51 1Z"/><path d="M297 986q21-20 47 1l2 20q-25 15-47-1Z"/></g>
            </>}
          </g>
        </g>

        <g id="npc" stroke="#3d4242" strokeLinecap="round" strokeLinejoin="round">
          {seated ? <g id="npc-seated">
            <ellipse cx="699" cy="1210" rx="175" ry="31" fill="#2f423f" stroke="none" opacity=".16"/>
            <g id="npc-lower-body" strokeWidth="10">
              <g id="npc-thigh" fill="#53636b"><path d="M608 979Q659 956 720 982L818 1039Q840 1060 824 1090Q810 1114 781 1108L681 1066Q624 1066 590 1032Z"/></g>
              <g id="npc-lower-leg" fill="#66757b"><path d="M784 1072Q811 1063 834 1086L829 1196Q824 1217 799 1218H766Q752 1211 758 1190Z"/><path d="M649 1051Q674 1045 693 1066L686 1185Q682 1207 658 1207H628Q615 1200 620 1179Z"/></g>
              <g id="npc-shoe" fill="#343e40"><path d="M755 1188Q796 1179 831 1200L860 1228Q864 1246 841 1251H750Q730 1245 735 1227Z"/><path d="M618 1178Q655 1171 685 1192L706 1219Q708 1237 685 1241H606Q590 1234 594 1218Z"/></g>
            </g>
            <g id="npc-torso" strokeWidth="11">
              <path fill={`url(#${uid}-coat)`} d="M587 738Q625 708 684 711Q746 710 780 755L793 964Q758 1004 690 1009Q620 1010 580 976L562 808Q559 768 587 738Z"/>
              <path fill="#8ea0aa" stroke="none" d="M585 759Q614 730 647 731L626 985Q598 981 582 963L570 809Q567 781 585 759Z" opacity=".4"/>
              <path fill="#e5c5a7" d="M646 694L647 732Q676 756 704 727L704 683Z"/>
            </g>
            <g id="npc-arms" fill={`url(#${uid}-coat)`} strokeWidth="10">
              <path d="M584 765Q550 786 558 832L588 941Q598 963 623 951L638 935L614 789Z"/><path d="M768 765Q798 779 801 821L790 933Q786 957 761 950L745 931L748 795Z"/>
              <path fill="#e5c5a7" d="M590 926q25-19 45 5l8 23q-24 19-48 1Zm154-2q24-19 45 4l5 22q-24 17-47 0Z"/>
            </g>
          </g> : <g id="npc-standing">
            <ellipse cx="747" cy="1375" rx="142" ry="32" fill="#2f423f" stroke="none" opacity=".16"/>
            <g id="npc-lower-body" strokeWidth="10">
              <g id="npc-thigh" fill="#53636b"><path d="M657 919Q704 902 746 921L749 1111Q725 1132 685 1116L652 987Z"/><path d="M744 918Q782 908 814 936L849 1104Q828 1130 789 1122L738 991Z"/></g>
              <g id="npc-lower-leg" fill="#66757b"><path d="M685 1102Q717 1093 747 1110L735 1307Q725 1330 690 1323L668 1313Z"/><path d="M792 1110Q824 1097 850 1118L865 1307Q856 1333 822 1329L800 1317Z"/></g>
              <g id="npc-shoe" fill="#343e40"><path d="M665 1301Q704 1292 736 1313L758 1341Q760 1362 734 1367H650Q628 1361 636 1339Z"/><path d="M801 1306Q836 1298 865 1319L892 1349Q894 1368 869 1373H785Q765 1365 773 1345Z"/></g>
            </g>
            <g id="npc-torso" strokeWidth="11">
              <path fill={`url(#${uid}-coat)`} d="M639 716Q677 686 735 691Q791 694 817 739L830 930Q793 970 731 973Q672 971 631 938L614 781Q611 744 639 716Z"/>
              <path fill="#8ea0aa" stroke="none" d="M639 738Q666 710 700 711L678 950Q650 945 634 927L623 782Q620 755 639 738Z" opacity=".4"/>
              <path fill="#e5c5a7" d="M695 671L697 713Q725 737 754 708L754 662Z"/>
            </g>
            <g id="npc-arms" fill={`url(#${uid}-coat)`} strokeWidth="10">
              <path d="M637 740Q603 758 606 805L625 984Q632 1008 659 998L674 981L666 766Z"/><path d="M804 747Q832 765 834 805L848 973Q847 999 820 998L804 981L783 775Z"/>
              <g id="npc-hand" fill="#e5c5a7"><path d="M623 974q26-20 48 4l3 28q-26 23-48 0Z"/><path d="M809 972q25-19 47 4l1 27q-23 22-46 1Z"/></g>
            </g>
          </g>}
          <g id="npc-head" transform={seated ? 'translate(-55 -4)' : undefined}>
            <path fill="#e5c5a7" strokeWidth="10" d="M647 518Q661 458 722 438Q786 424 828 466Q862 499 854 559Q849 613 807 644Q764 675 715 655Q665 636 649 588Q640 554 647 518Z"/>
            <path fill="#434a4b" strokeWidth="9" d="M649 536Q636 482 679 447Q726 408 786 434Q827 451 850 493Q814 472 785 486Q745 510 707 481Q688 522 649 536Z"/>
            <path fill="none" stroke="#434a4b" strokeWidth="17" d="M846 500Q866 548 844 592"/>
            <g id="npc-face" fill="none" strokeWidth="6">
              <path d="M697 548q12-8 25 0m53-5q12-7 24 0"/>
              <path strokeWidth="8" d="M710 561h1m77-3h1"/>
              <path stroke="#9f7465" strokeWidth="5" d="M741 590q12 6 24-3"/>
              <path stroke="#c78d7d" strokeWidth="7" d="M680 584h13m111-6h12" opacity=".45"/>
            </g>
          </g>
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
  </main>
}
