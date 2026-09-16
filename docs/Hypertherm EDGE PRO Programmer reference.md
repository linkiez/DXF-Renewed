

## EDGE
## ®
## Connect
## Programmer Reference
## 809550 – REVISION 6
## ENGLISH

EDGE, Phoenix, HPR, HPRXD, HPR130XD, HPR260XD, HPR400XD, CutPro, Remote Help, XPR, Powermax, SYNC,
SmartSYNC, and Hypertherm are trademarks of Hypertherm, Inc. and may be registered in the United States and other countries.
All other trademarks are the property of their respective holders.
Environmental stewardship is one of Hypertherm’s core values. www.hypertherm.com/environment
## © 2025 Hypertherm, Inc. 100% Associate-owned.

## Hypertherm, Inc.
Hanover, NH 03755 USA
www.hypertherm.com
## EDGE
## ®
## Connect
## Programmer Reference
## 809550
## REVISION 6
## English
Original instructions
## April 2025

## Hypertherm, Inc.
21 Great Hollow Road, P.O. Box 5010
Hanover, NH 03755 USA
603-643-3441 Tel (Main Office)
603-643-5352 Fax (All Departments)
info@hypertherm.com (Main Office)
800-643-9878 Tel (Technical Service)
technical.service@hypertherm.com (Technical Service)
800-737-2978 Tel (Customer Service)
customer.service@hypertherm.com (Customer Service)
Hypertherm México, S.A. de C.V.
## 52 55 5681 8109 Tel
## 52 55 5681 7978 Tel
soporte.tecnico@hypertherm.com (Technical Service)
Hypertherm Plasmatechnik GmbH
Sophie-Scholl-Platz 5
## 63452 Hanau
## Germany
## 00 800 33 24 97 37 Tel
## 00 800 49 73 73 29 Fax
31 (0) 165 596900 Tel (Technical Service)
00 800 4973 7843 Tel (Technical Service)
technicalservice.emeia@hypertherm.com (Technical Service)
Hypertherm (Singapore) Pte Ltd.
## Solaris @ Kallang 164
## 164 Kallang Way #03-13
Singapore 349248, Republic of Singapore
## 65 6841 2489 Tel
## 65 6841 2490 Fax
marketing.asia@hypertherm.com (Marketing)
techsupportapac@hypertherm.com (Technical Service)
## Hypertherm Japan Ltd.
## Level 9, Edobori Center Building
## 2-1-1 Edobori, Nishi-ku
## Osaka 550-0002 Japan
## 81 6 6225 1183 Tel
## 81 6 6225 1184 Fax
htjapan.info@hypertherm.com (Main Office)
techsupportapac@hypertherm.com (Technical Service)
Hypertherm Europe B.V.
Laan van Kopenhagen 100
3317 DM Dordrecht
## Nederland
## 31 165 596907 Tel
## 31 165 596901 Fax
31 165 596908 Tel (Marketing)
31 (0) 165 596900 Tel (Technical Service)
00 800 4973 7843 Tel (Technical Service)
technicalservice.emeia@hypertherm.com (Technical Service)
Hypertherm (Shanghai) Trading Co., Ltd.
B301, 495 ShangZhong Road
## Shanghai, 200231
PR China
## 86-21-80231122 Tel
## 86-21-80231120 Fax
86-21-80231128 Tel (Technical Service)
techsupport.china@hypertherm.com (Technical Service)
## South America & Central America: Hypertherm Brasil Ltda.
## 55 11 5116-8015 Tel
tecnico.sa@hypertherm.com (Technical Service)
## Hypertherm Korea Branch
#3904. APEC-ro 17. Heaundae-gu. Busan.
## Korea 48060
## 82 (0)51 747 0358 Tel
## 82 (0)51 701 0358 Fax
marketing.korea@hypertherm.com (Marketing)
techsupportapac@hypertherm.com (Technical Service)
## Hypertherm Pty. Limited
## Level 57, 25 Martin Place
## Sydney, New South Wales, 2000.
## +61 (02) 9238 2138 Tel
www.hyperthermassociates.com
Hypertherm (India) Thermal Cutting Pvt. Ltd
## A-18 / B-1 Extension,
Mohan Co-Operative Industrial Estate,
## Mathura Road, New Delhi 110044, India
## 91-11-40521201/ 2/ 3 Tel
## 91-11 40521204 Fax
htindia.info@hypertherm.com (Main Office)
technicalservice.emeia@hypertherm.com (Technical Service)
For training and education resources, go to the Hypertherm Cutting Institute (HCI) online at
www.hypertherm.com/hci.

EDGE ConnectProgrammer Reference8095505
## Contents
1   EIA RS-274D Program Support................................................................................................. 8
Directly Supported EIA Codes ..........................................................................................................................  9
Supported legacy codes ....................................................................................................................... 17
Unsupported EIA Codes ................................................................................................................................... 18
EIA Comments..................................................................................................................................................... 19
2   ESSI Code Support ................................................................................................................... 20
Mapped ESSI Codes ......................................................................................................................................... 21
Unsupported ESSI Codes ................................................................................................................................ 24
ESSI Comments.................................................................................................................................................. 25
3   ASCII Codes................................................................................................................................ 26
Control Codes ..................................................................................................................................................... 26
All Codes .............................................................................................................................................................. 27
4   G59 Process Variables ............................................................................................................. 30
Variable Types...................................................................................................................................................... 31
Part program format............................................................................................................................................ 33
Sample part program ............................................................................................................................. 33
V5xx Variables ...................................................................................................................................................... 35
Torch type ................................................................................................................................................. 36
Material type ............................................................................................................................................. 37
Plasma current ......................................................................................................................................... 38

## Contents

6809550Programmer ReferenceEDGE Connect
Plasma/shield gas ................................................................................................................................... 39
Cutting surface ........................................................................................................................................ 39
Material Thickness .................................................................................................................................. 40
Water Muffler ........................................................................................................................................... 47
Waterjet nozzle size................................................................................................................................ 47
Waterjet orifice size ................................................................................................................................ 47
Waterjet cut pressure ............................................................................................................................ 47
Fuel gas for Oxyfuel ................................................................................................................................ 47
Oxyfuel tip type ........................................................................................................................................ 48
Oxyfuel tip size ......................................................................................................................................... 48
V6xx plasma height control variables.............................................................................................................. 49
THC Index Code ................................................................................................................................................. 51
Sample part program using THC index code................................................................................... 51
V8xx waterjet variables....................................................................................................................................... 52
5   XPR Part Programs .................................................................................................................. 55
Basic cutting and marking................................................................................................................................. 55
Basic process selection and overrides .............................................................................................. 56
Basic code view ...................................................................................................................................... 56
Code definitions and exceptions ......................................................................................................... 56
CAM software part programs for XPR ........................................................................................................... 57
Process selection.................................................................................................................................... 57
Process overrides ................................................................................................................................... 58
Marking codes ......................................................................................................................................... 61
True Hole codes ...................................................................................................................................... 63
Interior contour codes ............................................................................................................................ 63
THC Index Code ..................................................................................................................................... 63
XPR part program format guidelines and examples........................................................................ 63
Sample XPR cutting part program ...................................................................................................... 65
Sample XPR marking part program .................................................................................................... 66
6   Advanced Feature Codes ......................................................................................................... 67
Kerf Table Codes ................................................................................................................................................ 67
Special Kerf and G59 Code Settings ............................................................................................................ 67
Kerf Override ............................................................................................................................................ 67
G59 Code Override ............................................................................................................................... 67
Parallel Kerf Enable for Hole Center Piercing .................................................................................. 68
Tilt / Rotator Part Codes ................................................................................................................................... 68
Station Select Codes......................................................................................................................................... 69
Process Select Codes....................................................................................................................................... 69

## Contents

EDGE ConnectProgrammer Reference8095507
Automatic Plate Alignment Codes .................................................................................................................. 69
Automatic Torch Spacing.................................................................................................................................. 70
Automatic Torch Spacing Program Codes................................................................................................... 72
Automatic Torch Spacing I/O .............................................................................................................. 72
Example Part Program ....................................................................................................................................... 72
Dual Transverse cutting ..................................................................................................................................... 73
Beveling................................................................................................................................................................. 74
Contour Bevel Head for Oxyfuel Cutting (CBH) ............................................................................. 74
Tilt Rotator Plasma Bevel ...................................................................................................................... 74
Dual Tilt Rotator Plasma Bevel............................................................................................................. 75
Bevel Angle Change on the Fly (BACF)............................................................................................ 76
RACF – Rotate Angle Change on the Fly ......................................................................................... 76
M and G Codes Used for Beveling .................................................................................................... 76
Drilling and Tapping using a PLC........................................................................................................ 77
All Possible Axis Assignments ......................................................................................................................... 77
Special Passwords ............................................................................................................................................. 78
NRT – No Rotate Tilt .............................................................................................................................. 78
RT – Rotate Tilt........................................................................................................................................ 78
1RT - 1 Rotate Tilt .................................................................................................................................. 78
7   Subparts ..................................................................................................................................... 79
8   Marker Font Generator ............................................................................................................ 82
Marker Font Generator program code ........................................................................................................... 82
Examples ................................................................................................................................................... 85
Marker Font Generator font options ............................................................................................................... 86
Internal Fonts............................................................................................................................................ 86
External Fonts........................................................................................................................................... 86
Custom Fonts........................................................................................................................................... 87
9   EoE Command Messages ........................................................................................................ 89
10   Import DXF Files ....................................................................................................................... 90
11   Appendix: Mapped EIA Codes................................................................................................. 92

EDGE ConnectProgrammer Reference8095508
EIA RS-274D Program Support
The EDGE
## ®
Connect CNC supports EIA RS-274D part programs. An EIA RS-274D program lists
the codes that are used to create a part. The Phoenix software provides the Shape Wizard
## ®

graphical programming environment to help you edit your programs.
The following lists define the EIA codes that are directly supported or currently unsupported by the
CNC. Mapped EIA codes are provided in the Appendix on page 92. Unsupported EIA codes are
ignored. All other EIA codes generate an error.
## 
When using XPR, see also XPR Part Programs on page 55.
## 
Hypertherm recommends including a blank space between codes that
appear on the same line in a part program (even though this is not
required for some legacy codes).

EIA RS-274D Program Support
## 1
EDGE ConnectProgrammer Reference8095509
Directly Supported EIA Codes
EIA codeDescription
FxMachine Speed.
FAxTime delay in milliseconds to smooth active bevel motion across non-tangent segments.
The feature is supported with the ABXYZ or ACXYZ bevel head when the Follower is ON.
This delay allows the C axis (imaginary or real) to lag behind by the defined FA-value to help
prevent a large positional command at the intersection of non-tangent segments.
NxLine number.
(text)Comments.
XxxX Axis Endpoint or other Data.
YxxY Axis Endpoint or other Data.
IxxI Axis Integrand or Part Option Data.
JxxJ Axis Integrand or Part Option Data.
Oxx SxxOutput (1-64), State (0-Off or 1-On).
Wxx SxxWait for Input (1-64), State (0-Off or 1-On).
G00 Xx YxRapid traverse (linear interpolation).
G00 AxSets Tilt angle – A is the angle value in degrees.
G01 XYxx AxxPerforms Linear Interpolation of Tilt angle along line segment.
G00 Xx YxTraverse command where x = value to move the desired axes a distance.
G00 Zx.xx TxIndex THC height Z distance for torch T. Manual mode only.
G00 CxxMove to rotate “C” position.
G00 C180-Rotate Axis offset 180 degrees will continue to rotate in the proper direction.
G00 C-180-Rotate Axis offset -180 degrees will continue to rotate in the proper direction.
G00 Px Tx Sx RxRotate Transverse 2 axis for square or rectangular tube positioning using program cutting
speed.
P = +/- 180 degrees
T = Top measurement of tube
S = Side measurement of tube
R = Corner radius, +/- 90 degrees
X or Y = Optional: Rail axis position
G01 Xx YxLinear interpolation (cut) at program cut speed.
G01 Ax FxSets Tilt angle, A-axis position in degrees with a speed command (F) in RPM. F is required.
G01 Cx FxSets Rotate angle, C-axis position in degrees with a speed command (F) in RPM. F is
required.

EIA RS-274D Program Support
## 1
10809550Programmer ReferenceEDGE Connect
G01 C180- FxRotate Axis offset 180 degrees with speed command in RPM. F is required.
G00 Px Tx Sx RxRotate Transverse 2 axis for square or rectangular tube positioning using program cutting
speed.
P = +/- 180 degrees
T = Top measurement of tube
S = Side measurement of tube
R = Corner radius, +/- 90 degrees
X or Y = Optional: Rail axis position
G01 Xx YxLinear interpolation (cut) at program cut speed.
G01 Ax FxSets Tilt angle, A-axis position in degrees with a speed command (F) in RPM. F is required.
G01 Cx FxSets Rotate angle, C-axis position in degrees with a speed command (F) in RPM. F is
required.
G01 C180- FxRotate Axis offset 180 degrees with speed command in RPM. F is required.
G01 C-180- FxRotate Axis offset -180 degrees with speed command in RPM. F is required.
G01 Px Fx Tx  Sx RxRotate Transverse 2 axis for square or rectangular tube cutting with the ability to change
the RPM (pipe rotational speed).
P = +/- 180 degrees
F = Rotational speed in RPM
T = Top measurement of tube
S = Side measurement of tube
R = Corner radius, +/- 90 degrees
X or Y = Optional: Rail axis position
G02 Xx Yx Ix JxClockwise Circle or Arc.
Xx Yx = Arc end point (If omitted, the default end point is the current position of
the torch.)
Ix Jx = Arc center point (radius value)
G03 Xx Yx Ix JxCounterclockwise Circle or Arc.
Xx Yx = Arc end point (If omitted, the default end point is the current position of
the torch.)
Ix Jx = Arc center point (radius value)
G04Preset Dwell (uses Setup Dwell Time).
G04 xxProgram Dwell in Seconds.
G08 X xRepeat Subroutine X Times.F
G20Select English Units (inches).
EIA codeDescription

EIA RS-274D Program Support
## 1
EDGE ConnectProgrammer Reference80955011
G21Select Metric Units (mm).
G40Disable Kerf Compensation.
G41Enable Left Kerf Compensation.
G42Enable Right Kerf Compensation.
G43 XxKerf Value.
G41 D1-200Enables Left Kerf using a Kerf Table variable.
G42 D1-200Enables Right Kerf using a Kerf Table variable.
G43 D1-200Sets the current Kerf value via the Kerf Table using prior set Left / Right Kerf.
G59 D1-200XxSets Kerf table variable from 1200.
G59 Vxx FxxThis command selects Hypertherm CNC cut chart parameters from within part programs.
G59 commands can also override certain parameters in the Process screen. This use of
the G59 code is unique to Hypertherm part programs that run on a Hypertherm CNC. See
G59 Process Variables on page 30.
## 
For XPR, see page 57.
G66 Dx Bx CxAuto Align 3 Point Method with Long Offset Distance, Fast Speed, Slow Speed values
respectively.
G82Oxyfuel Cut Mode.
G83Oxyfuel Cut Mode Contour Bevel Head.
G84Plasma Cut Mode.
G85Plasma Cut Mode Contour Bevel Head.
G90Absolute Programming Mode.
G91Incremental Programming Mode.
G92Set Axis Presets.
EIA codeDescription

EIA RS-274D Program Support
## 1
12809550Programmer ReferenceEDGE Connect
G93 Xx.xxxBevel consumable correction. Adds or subtracts a value from the Bevel Pivot Length
parameter used only with ABXYZ bevel heads. The Bevel Pivot Length baseline value uses
130 A O2/Air consumables for HPRXD and 170A O2/Air for XPR. When using a different
consumable set, issue the G93 code at the beginning of the part program (after setting the
part program units) to change the Bevel Pivot Length.
HPRXD example: G93 X0.035 adds 0.035 inches (0.89 mm) to the Bevel Pivot Length to
correct for HPR260XD consumables.
80 A O2/Air = 0.000 inches or mm
130 A O2/Air = 0.000 inches or mm
200 A O2/Air = 0.011 inches or 0.28 mm
260 A O2/Air = 0.035 inches or 0.89 mm
400 A O2/Air = -0.019 inches or -0.48 mm (The 400 A values are subtracted
from the Bevel Pivot Length.)
XPR example: G93 X0.030 adds 0.030 inches (0.76 mm) to the Bevel Pivot Length to
correct for XPR130 A consumables.
80 A O2/Air = 0.058 inches or 1.47 mm
130 A O2/Air = 0.030 inches or 0.76 mm
170 A O2/Air = 0.000 inches or 0.00 mm
300 A O2/Air = -0.007 inches or -0.18 mm (The 300 A values are subtracted from the
## Bevel Pivot Length.)
G96 X xx
or Y xx
G96 identifies the part program as a pipe program.
Identify the Transverse 2 axis (X or Y).
Phoenix then sets the rotational speed of a rotating Transverse 2 using the circumference
of the pipe which it calculates from the diameter (xx).
G97Program Repeat Pointer.
G97 TxProgram Repeat Pointer. Executes the repeat T times.
G98Repeat at G97, or start of program if no G97.
G99Part Options.
M00Program Stop.
M01Optional Program Stop (uses Setup Parameter).
M02End of Program.
EIA codeDescription

EIA RS-274D Program Support
## 1
EDGE ConnectProgrammer Reference80955013
EIA codeDescription
M07Cut On.*
## M07 HS
Forces an IHS for cutting, regardless of the distance between cuts or any previous M08
command.*
M08Cut Off.*
## M08 RF
Retracts to Full Retract height at the end of a cut.* Works only with Sensor THC.
M08 Tx.xx RTTurns OFF Cut Control x.xx (seconds) before the end of the cut (-1.0 sec – 10.0 sec).
Retracts to Transfer Height instead of the Retract Height.
M08 Txx.xxCut Off.*
T = Temporary Optional Time Delay from –1 to 99.99 seconds
M09Enable Marker 1.*
M09 HSForces an IHS for marking, regardless of the distance between marks or any previous M10
RT command.*
M10Disable Marker 1.*
M10 RFRetracts to Retract Height. Works only with Sensor THC.*
M10 RTRetracts to the Transfer Height instead of the Retract Height at the end of a mark.
M11Marker Offset 1 On.*
M12Marker Offset 1 Off.*
M13Enable Marker 2.*
M14Disable Marker 2.*
M14 RFRetracts to Retract Height. Works only with Sensor THC. (Not applicable for XPR.)
M17Oxy Gas On.
M18Oxy Gas Off.
M19Cancel All Stations.
## M26
## Station Select On.
(Not applicable for XPR.)
## M27
## Station Select Off.
(Not applicable for XPR.)
M28Follower Disabled / CBH rotator disable or disable automatic control of C axis.
M29Follower Enable / CBH rotator disable/ enable automatic control of C axis.
M30End of Program (same as M02).
M31Reset Functions (Cut Off, Marker Off, Kerf Off).
M32Unclamp / Unlock All Stations.
M32 TxxUnclamp / Unlock T Station, where T = 1 through 19.
M33Unclamp / Lock All Stations.
- For XPR, see page 55 – page 66.

EIA RS-274D Program Support
## 1
14809550Programmer ReferenceEDGE Connect
M34Clamp / Unlock All Stations.
M34 TxxClamp / Unlock T Station, where T = 1 through 19.
M35Clamp / Unlock All Stations Mirror.
M35 TxxClamp / Unlock Mirror T Station, where T = 1 through 19.
M36 TxProcess Select T where x selects the process
## 1 = Plasma 1
## 2 = Plasma 2
## 3 = Marker 1*
## 4 = Marker 2*
## 6 = Waterjet
M37 Txx (1-20)Select Station T where T = 1 through 20.
M38 Txx (1-20)Deselect Station T where T = 1 through 20.
M40Start of Subroutine.
M40 xStart of Subroutine. Executes the repeat X times.
M41End of Subroutine.
M48Speed Override Enable.
M49Speed Override Disable.
M50Disable torch height control.
M50  H-x.xxFor  HPR  and  XPR,  turns  OFF  Cut  Control  x.xx  (seconds)  before  the  end  of  current  line
segment. The torch does not start to decelerate until the line segment after the M50H.
M50NDisables Height Control and temporarily turns OFF the Nozzle Contact Cutting feature in
## Phoenix.
M51 Txx.xxEnable torch height control (Optional Time Delay in seconds before enable).
M52Disable Sensor THC and raise torch (for oxyfuel parts only).
M53Enable Sensor THC and lower torch (for oxyfuel parts only).
M63User Defined 1 On.
M64User Defined 1 Off.
M54User Defined 2 On.
M55User Defined 2 Off.
EIA codeDescription
- For XPR, see page 55 – page 66.

EIA RS-274D Program Support
## 1
EDGE ConnectProgrammer Reference80955015
M56User Defined 3 On.
M57User Defined 3 Off.
M58User Defined 4 On.
M59User Defined 4 Off.
EIA codeDescription
M65End of Program for Auto Reload. Use only with Auto Reload.*
Files called for Auto Reload must use these file naming guidelines:
-   Numeric (such as 1234.txt) or alphanumeric (such as 1234ABC.txt)
-   Numeric characters must precede alpha characters.
Example: 123ABC.txt is supported, but ABC123.txt is not supported.
-   The file extension must only contain letters.
Example: .txt is supported, but .7z and .$$$ are not supported.
-   In commands that call more than one file, include a number at the start of each file
name to indicate the sequence in which the files must run. This will prevent the files
from running in a random sequence.
## Example:
## File Name – Run Sequence
1Triangle.txt – Loads first because the file name begins with 1.
2Square.txt – Loads second because the file name begins with 2.
3Octagon.txt – Loads third because the file name begins with 3.
M72Marker Offset 2 Off.*
M73Marker Offset 2 On.*
M75A Axis/Tilt Go to Home Position - Rapid Index.
M76C Axis/Rotate Go to Home Position - Rapid Index.
M77Go to Home position Y Axis.
M78Go to Home position X Axis.
M79 Tx (1-4)Go To Home Position (1-4).
M84Disable Mirror Head 2.
M85Enable Mirror Head 2.
M86Unpark Head 1.
M87Park Head 1.
M88Unpark Head 2.
- For XPR, see page 55 – page 66.
EIA codeDescription
- For XPR, see page 55 – page 66.

EIA RS-274D Program Support
## 1
16809550Programmer ReferenceEDGE Connect
M89Park Head 2.
M90Aligns CBH / Rotator to Tangent angle of next cut segment.
M90-Aligns CBH / Rotator negative to tangent angle of next cut segment.
M91Space Head 2. Includes a spacingvalue that is an absolute position on the specified axis.
M92Space Head 1. Includes a spacingvalue that is an absolute position on the specified axis.
M93Drill Cycle output.
M94Peck Drill Cycle output.
M95Tap Cycle output.
M96Tool Change output.
M274Marker Offset 3 Off.*
M275Marker Offset 3 On.*
M276Marker Offset 4 Off.*
M277Marker Offset 4 On.*
M278Marker Offset 5 Off.*
M279Marker Offset 5 On.*
M280Marker Offset 6 Off.*
M281Marker Offset 6 On.*
M282Marker Offset 7 Off.*
M283Marker Offset 7 On.*
M284Marker Offset 8 Off.*
M285Marker Offset 8 On.*
M286Marker Offset 9 Off.*
M287Marker Offset 9 On.*
M288Marker Offset 10 Off.*
M289Marker Offset 10 On.*
M290Marker Offset 11 Off.*
M291Marker Offset 11 On.*
M292Marker Offset 12 Off.*
M293Marker Offset 12 On.*
M301Assigns the current X/Y position to Home Position 1.
M302Assigns the current X/Y position to Home Position 2.
EIA codeDescription
- For XPR, see page 55 – page 66.

EIA RS-274D Program Support
## 1
EDGE ConnectProgrammer Reference80955017
Supported legacy codes
The legacy codes listed below are not recommended for use with EDGE Connect.
M303Assigns the current X/Y position to Home Position 3.
M304Assigns the current X/Y position to Home Position 4.
M305Assigns the current X/Y position to Home Position 5.
M306Assigns the current X/Y position to Home Position 6.
M307Assigns the current X/Y position to Home Position 7.
M308Assigns the current X/Y position to Home Position 8.
M309Assigns the current X/Y position to Home Position 9.
M310Assigns the current X/Y position to Home Position 10.
M311Assigns the current X/Y position to Home Position 11.
M312Assigns the current X/Y position to Home Position 12.
EIA codeDescription
- For XPR, see page 55 – page 66.
M15Cut On.
M16Cut Off.

EIA RS-274D Program Support
## 1
18809550Programmer ReferenceEDGE Connect
Unsupported EIA Codes
EIA CodeDescription
G30Mirror Off
G46Table 0 Select
G94Feed per minute
G95Feed per rev
G99Freestanding G99
G103 QnameStop Current Program/ Load New Program
G201Incremental Line In2
G202Incremental CW Arc In2
G203Incremental CCW Arc In2
G211Incremental Line In3
G212Incremental CW Arc In3
G213Incremental CCW Arc In3
G221Absolute Line In2
G222Absolute CW Arc In2
G223Absolute CCW Arc In2
G231Absolute Line In3
G232Absolute CW Arc In3
G233Absolute CCW Arc In3
G240Programmable Kerf
G247Table 1 Select
G248Table 2 Select
G249Table 3 Select
G250Table 4 Select
G276Internal Variable Load
G277External Variable Load
G278X Axis Home
G279Y Axis Home
G280X Home Return
G281Y Home Return
M66PLC Control Code

EIA RS-274D Program Support
## 1
EDGE ConnectProgrammer Reference80955019
The unsupported EIA codes previously noted are ignored when read. Some of these codes may be
supported in the future. Any EIA codes that are not listed above will result in a translator error upon
loading the EIA program. Known EIA codes that will not be accepted include, but are not limited to:
Pxx: Program number
Dxx: Indexed Kerf operations
Vxx: Internal variable load
EIA Comments
Comments may be placed into the part program to be displayed on screen and viewed by the
operator. The comment line must first be preceded by a program stop command (EIA M00 code or
ESSI 0 code). For example:
M00 – Pauses Program
(Comment) – Text to be displayed
M75Ignored if not using CBH, Tilt Rotator(s)
M76Ignored if not using CBH, Tilt Rotator(s)
M210X Sign Toggle
M211Y Sign Toggle
M212X and Y Swap and Toggle
M231Aux. State Reset
M261Aux. Torch Master On
M262Aux. Torch Master Off
EIA CodeDescription

EDGE ConnectProgrammer Reference80955020
ESSI Code Support
The EDGE
## ®
Connect CNC supports ESSI part programs as defined by the International Standards
Organization in ISO 6582. An ESSI program lists the sequence of lines, arcs, speeds, kerf and I/O
functions used to create a part.
When you open an ESSI part program, Phoenix converts it to EIA codes. This section shows the
ESSI codes that Phoenix converts into EIA, and unsupported ESSI codes. Phoenix ignores
unsupported ESSI codes. All other ESSI codes generate errors.
For the ESSI part program to convert and run, you must specify the ESSI termination code used by
the part program.
1.Close Phoenix.
2.Open the file C:\Phoenix\Phoenix.ini file.
3.Save a copy of Phoenix.ini as a backup.
4.Locate the [Cutting] section of the file.
5.Change the value of the following line to specify the end of program code:
ESSIProgramTermination=0.
6.Enter a value 0 – 5.
0 = 0 is the ESSI termination code3 = 99
## 1 = 644 = /
2 = 635 = ‘=’ (equal sign)

ESSI Code Support
## 2
EDGE ConnectProgrammer Reference80955021
7.Before you save the file, change the Checksum line (the first line in Phoenix.ini) to
Checksum=RESET (RESET must be all capital letters.)
8.Restart Phoenix.
Mapped ESSI Codes
ESSI CodeDescriptionMapped to EIA
%Start of ProgramNot Used-Automatic
+/-value...Line or ArcG00, G01, G02 or G03 as appropriate
0End Program or StopM02 or M00 (if 64 is End Program)
3Start Comment(
4End Comment)
5Enable Rapid TraverseNot Used-Automatic
6Disable Rapid TraverseNot Used-Automatic
7Cutting Device OnM07
8Cutting Device OffM08
9Enable Marker 1M09
10Disable Marker 1M10
11Marker Offset 1 OnM11
12Marker Offset 1 OffM12
11+1Marker Offset 1 OnM11
12+1Marker Offset 1 OffM12
11+2Marker Offset 2 OnM73
12+2Marker Offset 2 OffM72
11+3Marker Offset 3 OnM275
12+3Marker Offset 3 OffM274
11+4Marker Offset 4 OnM277
12+4Marker Offset 4 OffM276
11+5Marker Offset 5 OnM279
12+5Marker Offset 5 OffM278
11+6Marker Offset 6 OnM281
12+6Marker Offset 6 OffM280
11+7Marker Offset 7 OnM283

ESSI Code Support
## 2
22809550Programmer ReferenceEDGE Connect
11+8Marker Offset 8 OnM285
12+8Marker Offset 8 OffM284
13Enable Marker 2M13
14Disable Marker 2M14
15Marker Offset 2 OnM73
16Marker Offset 2 OffM72
21No Mirror, No RotateG99 X1 Y0 I0 J0
22Mirror Y, No RotateG99 X1 Y0 I0 J1
23Mirror X and YG99 X1 Y0 I1 J1
24Mirror X, No RotateG99 X1 Y0 I1 J0
25Mirror X/Y on -45 DegG99 X1 Y270 I1 J0
26Rotate 90 Deg CCWG99 X1 Y90 I0 J0
27Mirror X/Y on +45 DegG99 X1 Y270 I0 J1
28Rotate 90 Deg CWG99 X1 Y270 I0 J0
29Enable Left Kerf CompG41
30Enable Right Kerf CompG42
38Disable KerfG40
39+valueMachine SpeedFvalue
40+valueProgrammable KerfG43 Xvalue
41Preset DwellG04
41+valueProgram Dwell in mSecG04 Xvalue
45Ht Sensor Enable/LowerM53
46Ht Sensor Disable/RaiseM52
47Ht Sensor EnableM51
48Ht Sensor DisableM50
51CBH EnableM29
52CBH DisableM28
53Cutting Device OnM07
54Cutting Device OffM08
63Reset FunctionsM31
64End ProgramM02
65End of Program/ ReloadM65
ESSI CodeDescriptionMapped to EIA

ESSI Code Support
## 2
EDGE ConnectProgrammer Reference80955023
67Ht Sensor DisableM50
68Ht Sensor EnableM51
70Select English Units (in)G20
71Select Metric Units (mm)G21
79+1Go To Home Position 1M79 T1
79+2Go To Home Position 2M79 T2
79+3Go To Home Position 3M79 T3
79+4Go To Home Position 4M79 T4
81Incremental ModeG91
82Absolute ModeG90
83Set Axis PresetsG92
90End of ProgramM02
97Program Repeat PointerG97
97+valueSubroutine LoopM40 Xvalue
98Repeat at 97, Subroutine loopG97, G98 or M41 as appropriate or start of program if
no 97
99End of ProgramM02
245Output 1 OnO1 S1
246Output 1 OffO1 S0
247Output 2 OnO2 S1
248Output 2 OffO2 S0
249Output 3 OnO3 S1
250Output 3 OffO3 S0
251Output 4 OnO4 S1
252Output 4 OffO4 S0
253Wait for Input 1 OnW1 S1
254Wait for Input 1 OffW1 S0
255Wait for Input 2 OnW2 S1
256Wait for Input 2 OffW2 S0
257Wait for Input 3 OnW3 S1
258Wait for Input 3 OffW3 S0
259Wait for Input 4 OnW4 S1
ESSI CodeDescriptionMapped to EIA

ESSI Code Support
## 2
24809550Programmer ReferenceEDGE Connect
Unsupported ESSI Codes
260Wait for Input 4 OffW4 S0
282Marker Offset 3 OnM275
283Marker Offset 3 OffM274
284Marker Offset 4 OnM277
285Marker Offset 4 OffM276
286Marker Offset 5 OnM279
287Marker Offset 5 OffM278
288Marker Offset 6 OnM281
289Marker Offset 6 OffM280
290Marker Offset 7 OnM283
291Marker Offset 7 OffM282
292Marker Offset 8 OnM285
293Marker Offset 8 OffM284
ESSI CodeDescription
103+NameStop Current Program/ Load New Program
237X Sign Toggle
238Y Sign Toggle
239X and Y Swap and Toggle
266Table 1 Select
267Table 2 Select
268Table 3 Select
269Table 4 Select
276Internal Variable Load
277External Variable Load
278X Axis Home
279Y Axis Home
280X Home Return
281Y Home Return
ESSI CodeDescriptionMapped to EIA

ESSI Code Support
## 2
EDGE ConnectProgrammer Reference80955025
The unsupported ESSI codes above are ignored when read. Some of these codes may be
supported in the future. Any ESSI codes that are not listed above will result in a translator error
upon loading the ESSI program.
ESSI Comments
Comments may be placed in to the part program to be displayed on screen and viewed by the
operator. The comment line must first be preceded by a program stop command (EIA M00 code or
ESSI 0 code).
ESSI example:
## 0 – Pauses Program
## 3 – Start Comment
Comment – Text to be displayed
## 4 – End Comment

EDGE ConnectProgrammer Reference80955026
ASCII Codes
This section provides the 128 ASCII codes (American Standard Code for Information Interchange)
as defined by ANSI (American National Standards Institute) Standard X3.4-1977.
## Control Codes
HexDecCharacternameDescription
000^ @NULNull
011^ASOHStart of Header
022^BSTXStart of Text
033^CETXEnd of Text
044^DEOTEnd of Transmission
055^EENQEnquiry
066^FACKAcknowledge
077^GB E LBell
088^HBSBackspace
099^IHTHorizontal Tab
0A10^JLFLine Feed
0B11^KVTVertical Tab
0C12^LFFForm Feed
0D13^MCRCarriage Return

ASCII Codes
## 3
EDGE ConnectProgrammer Reference80955027
## All Codes
0E14^NSOShift Out
0F15^OSIShift In
1016^PDLEData Link Escape
1117^QDCIDevice Control 1
1218^RDC2Device Control 2
1319^SDC3Device Control 3
1420^TDC4Device Control 4
1521^UNAKNegative Acknowledge
1622^VSYNSynchronous Idle
1723^WETBEnd Transmission Block
1824^XCANCancel
1925^YEMEnd of Medium
1A26^ZSubSubstitute
1B27^[ESCEscape
1C28^\FSFile Separator
1D29^]GSGroup Separator
1E30^^RSRecord Separator
1F31^_USUnit Separator
2032SPSpace
HexDecCharacterHexDecCharacterHexDecCharacter
## 000^ @2B43+5686V
## 011^A2C44,5787W
## 022^B2D45-5888X
## 033^C2E46.5989Y
## 044^D2F47/5A90Z
## 055^E304805B91[
## 066^F314915C92\
## 077^G325025D93]
## 088^H335135E94^
HexDecCharacternameDescription

ASCII Codes
## 3
28809550Programmer ReferenceEDGE Connect
## 099^I345245F95_
## 0A10^J355356096`
0B11^K365466197a
0C12^L375576298b
0D13^M385686399c
0E14^N3957964100d
0F15^O3A58:65101e
1016^P3B59;66102f
1117^Q3C60<67103g
1218^R3D61=68104h
1319^S3E62>69105i
1420^T3F63?6A106j
1521^U4064@6B107k
1622^V4165A6C108l
1723^W4266B6D109m
1824^X4367C6E110n
1925^Y4468D6D111o
1A26^Z4569E7012p
1B27^[4670F71113q
1C28^\4771G72114r
1D29^]4872H73115s
1E30^^4973I74116t
1F31^_4A74J75117u
20324B75K76118v
2133!4C76L77119w
2234“4D77M78120x
2335#4E78N79121y
2436$4F79O7A122z
## 2537%5080P7B123{
## 2638&5181Q7C124|
HexDecCharacterHexDecCharacterHexDecCharacter

ASCII Codes
## 3
EDGE ConnectProgrammer Reference80955029
## 2739‘5282R7D125}
## 2840(5383S7E126~
## 2941)5484T7F127¬
## 2A42‘5585U
HexDecCharacterHexDecCharacterHexDecCharacter

EDGE ConnectProgrammer Reference80955030
## G59 Process Variables
The EDGE
## ®
Connect provides cut charts for a variety of cutting processes: plasma, marker, and
waterjet. An operator can select a cut chart manually on the CNC, or the part program can issue
codes that select the cut chart automatically.
Computer aided manufacturing (CAM) software places process variables, called G59 codes, in the
part program to select the cut chart for a process. Using the process variables in the part program
automates cut chart selection on the CNC. This section lists the G59 code and its variables and
values supported by Hypertherm CNCs.
## 
This section does not apply to XPR part programs. See XPR Part
Programs on page 55.
## 
To use G59 codes in your part program, you must enable EIA G59 Code
Override on the Cutting screen on the CNC.

## G59 Process Variables
## 4
EDGE ConnectProgrammer Reference80955031
G59 codes use the following format:
## G59 Vxxx Fxx
## Where:
G59 = Load a variable
Vxxx = The variable type
Fxx = The variable value
xx or xxx = the number of digits for the F value. When the F value has a decimal, the value is
represented as xx.x
## Example: G59 V507 F33
## Where:
V507 = Plasma 1 Material Thickness
F33 = 0.5 inch
## Variable Types
The G59 code supports several variable types:
V5xx selects the process and makes selections within the cut chart.
V6xx selects plasma process parameters.
V825 and up selects waterjet process parameters.
The value for each variable must be present in the cut chart on the CNC. For example, if the part
program includes a G59 code with the material thickness variable with a value of ½ inch (G59 V507
F33) but the cut chart for that process does not include a material thickness of ½ inch, an “Invalid
Process” error will display when the CNC loads the program. To clear the error, you must remove
the unsupported code from the part program. For more information on resolving an “Invalid Process”
or “Conflicting Process” errors, see the Conflicting process section of the EDGE Connect
Installation and Setup Manual.
In addition, V5xx variables must be issued in the part program in the same order that they are listed
in the cut chart:
1.To r c h   Ty p e
2.Material Type
3.Specific Material (optional)
4.Process Current
5.Plasma/Shield Gases
6.Material Thickness

## G59 Process Variables
## 4
32809550Programmer ReferenceEDGE Connect
7.Cutting Surface
8.Water Muffler (for some older plasma supplies)
The V6xx variables override other parameters that are part of the cut chart, such as Arc Voltage, Cut
Height, Pierce Time, and Marker Amperage. The V6xx variables (listed on page 49 – page 50) are
not required when using process variables to select a cut chart; they are only needed when
overriding the values in the cut chart. For example, to change the value of Set Arc Voltage in the
Plasma 1 process from 120 VDC in the cut chart, to 125 VDC, issue a G59 V600 F125 code in the
part program.
V5xx codes
select the
cut chart
V6xx codes
overwrite
these
settings after
the cut chart
has loaded

## G59 Process Variables
## 4
EDGE ConnectProgrammer Reference80955033
Part program format
Hypertherm CNCs require that the G59 codes be in specific positions in the part program. Each
cut in the part starts with an M07 (Cut On) and ends with the M08 (Cut Off). The M07 and M08
turn on the Cut Control output which activates the cutting tool.
The G41 (Enable Left Kerf Compensation) or G42 (Enable Right Kerf Compensation) must
immediately precede the M07.
A combination of G59 V5xx codes (listed on page 35) locate the cut chart and must
precede the G41 or G42 code. Once the program selects the cut chart, the V5xx codes do
not need to be re-issued unless the program requires a change in process (a new cut chart).
V6xx and V8xx codes are needed only when overriding a cut chart value.
Sample part program
The order of the codes listed in the following table represent a typical part program.
CodeDescription
G20English units
G91Incremental mode
G99 X1 Y0 I0 J0Set part options
G59 V502 F34Plasma 1 HPRXD torch
G59 V503 F1.00Plasma 1 material type mild steel
G59 V504 F130Plasma 1 current 130 A
G59 V505 F2Plasma 1 plasma/shield gas O2/air
G59 V507 F33Plasma 1 material thickness 1/2 inch
G59 V525 F27Marker 1 plasma/shield gas air/air
G59 V658 F10Override Marker 1 current, set to 10 A
M36 T3Select Marker 1 process
M50Disable torch height control
M09Marker on
G03 X0 Y0 I0.5 J0Counterclockwise arc
M10Marker Off
M51Enable torch height control
G00 X-0.75 Y-1.299Rapid traverse
M36 T1Select Plasma 1 process
G59 V600 F125Override Plasma 1 arc voltage setting, set to 125 V
G41Enable left kerf

## G59 Process Variables
## 4
34809550Programmer ReferenceEDGE Connect
M07Cut on
G01 X0.176777 Y0.176777Line
G02 X0 Y0 I1.06066 J1.06066Clockwise arc
G01 X-0.1 Y0Line
M08Cut Off
G40Disable kerf
M02End program
CodeDescription

## G59 Process Variables
## 4
EDGE ConnectProgrammer Reference80955035
## V5xx Variables
The following table lists the V5xx variable types. The G59 codes that contain these variables must
be entered in the part program in the order listed below (the same order as they appear in the cut
chart). Each variable type has a set of Fx values. The following sections list the values for each
variable type.
VariablePlasma 1Plasma 2Marker 1Marker 2WaterjetOxyfuel
Torch TypeV502V512V522V532V561
Material TypeV503V513V523V533V553V562
## Process
## Current
## V504V514V524V534
Plasma/Shield
## Gases
## V505V515V525V535
## Cutting
## Surface*
## V506V516V526V536
## Material
## Thickness
## V507V517V527V537V557V564
Water Muffler*V508V518V528V538
Orifice SizeV554
Nozzle SizeV556
## Cut Pressure
## (waterjet)
## V558
Fuel GasV563
## Tip Type
(Oxyfuel)
## V566
Tip SizeV565
- Not required to select a cut chart.

## G59 Process Variables
## 4
36809550Programmer ReferenceEDGE Connect
Torch type
Add the torch type Fx values to the these variables:
## Examples:
G59 V512 F34 – Plasma 2, HPRXD torch.
G59 V561 F62 – Oxyfuel, Airco torch.
V502 Plasma 1 torch typeV512 Plasma 2 torch type
V522 Marker 1 torch typeV532 Marker 2 torch type
V561 Oxyfuel torch type
## F1 = MAX200F2 = SE200F3 = HT4400
F4 = FineLine200F5 = FineLine100F6 = LH2100S
## F7 = LH2100TF8 = LH2125SF9 = LH2125T
## F10 = PAC186F11 = T80MF12 = MAX100
F13 = MAX100DF14 = ArcWriterF15 = PAC620
## F16 = PAC123F17 = PAC125F18 = T60M
F19 = T100MF20 = HySpeedF21 = HPR
## F22 = LH1510SF23 = LH1510TF24 = LH1575S
F25 = LH1575TF26 = FineLine260F27 = FineCut
F28 = Spirit275F29 = HSDF30 = Spirit400
F31 = HPR BevelF32 = TDC_XT300F33 = TDC_XT301
F34 = HPRXDF35 = HPRXD BevelF36 = T45M
F37 = HPRXD Thick PierceF38 = LF150F39 = HyPro2000
F40 = TDC_XT300 BevelF42 = M45 (Powermax45)F43 = M65 (Powermax65)
F44 = M85 (Powermax85)F45 = HyPro2000 (Silver)F46 = Duramax Retrofit Torch
F47 = GenericF48 = Harris Model 80F49 = Harris Model 98
F50 = Victor MT 200F51 = Victor MT 300F52 = M105 (Powermax105)
F53 = Low Speed FineCutF54 = MAXPRO200F55 = Duramax Hyamp
F56 = Dialine 281F57 = Dialine 300F58 = FineCut Hyamp
F59 = Koike 100LF60 = Koike 200LF61 = Koike 500L
F62 = AircoF63 = IHTF64 = Meco
F65 = MesserF66 = OxyweldF67 = Smith
F68 = Duramax LockF69 = SmartSYNCF70 = MAXPRO200 Bevel
F71 = Duramax/Duramax Lock Cartridge Adapter

## G59 Process Variables
## 4
EDGE ConnectProgrammer Reference80955037
Material type
Add one of the following material type values to these variables
Material types (Fx)
Specific material (Fx.xx)
To select a specific cut chart process (such as True Hole
## ®
), add .xx to the Material Type Fx code.
Example: G59 V503 F1.01 – Plasma 1, mild steel, specific custom process 1.
The table that follows gives examples of process codes that can be added to material types
F1 – F6. CNC operators with supported plasma power supplies can also select these processes in
the Specific Material menu on the Cut Chart screen in Phoenix.
V503 Plasma 1 material typeV513 Plasma 2 material type
V523 Marker 1 material typeV533 Marker 2 material type
V553 Waterjet material typeV562 Oxyfuel
F1 = Mild SteelF4 = Other
F2 = Stainless SteelF5 = Brass
F3 = AluminumF6 = Copper
Plasma power
supply
## Specific
material
## Fx.xx
codeExample
## Powermax
(all models)
ProductionFx.90
G59 V503 F2.90 – Plasma 1, stainless steel,
## Powermax Production
## Powermax
(all models)
FineCutFx.91
G59 V503 F1.91 – Plasma 1, mild steel,
Powermax FineCut
## Powermax
(all models)
LS FineCutFx.92
G59 V503 F1.92 – Plasma 1, mild steel,
Powermax LS FineCut
Powermax 45XPDimplingFx.94
G59 V523 F1.94 – Plasma 1, mild steel,
Powermax45 XP Dimpling
Powermax 45XPLight MarkFx.95
G59 V523 F1.95 – Marker 1, mild steel,
Powermax45 XP Light Mark
Powermax 45XPHeavy MarkFx.96
G59 V523 F2.96 – Marker 1, stainless steel,
Powermax45 XP Heavy Mark
HPRFine FeatureFx.97
G59 V503 F1.97 – Plasma 1, mild steel, HPR
## Fine Feature
HPRTrue HoleFx.99
G59 V503 F1.99 – Plasma 1, mild steel, HPR
## True Hole

## G59 Process Variables
## 4
38809550Programmer ReferenceEDGE Connect
Plasma current
Add one of the following process current values to these variables:
Example: G59 V514 F100 – Plasma 2, 100 A process current.
V504 Plasma 1 currentV514 Plasma 2 current
V524 Marker 1 power
current
V534 Marker 2 current
## F5 = 5 AF7 = 7 AF8 = 8 A
## F9 = 9 AF10 = 10 AF15 = 15 A
## F18 = 18 AF20 = 20 AF22 = 22 A
## F25 = 25 AF30 = 30 AF35 = 35 A
## F40 = 40 AF45 = 45 AF50 = 50 A
## F55 = 55 AF60 = 60 AF65 = 65 A
## F70 = 70 AF80 = 80 AF85 = 85 A
## F100 = 100 AF105 = 105 AF125 = 125 A
## F130 = 130 AF150 = 150 AF200 = 200 A
## F260 = 260 AF275 = 275 AF300 = 300 A
## F340 = 340 AF400 = 400 AF500 = 500 A
## F600 = 600 AF760 = 760 AF800 = 800 A
## F1000 = 1000 AF1500 = 1500 AF2000 = 2000 A
## F2500 = 2500 AF3000 = 3000 AF3500 = 3500 A
## F4000 = 4000 AF4500 = 4500 AF5000 = 5000 A
## F5500 = 5500 AF6000 = 6000 A

## G59 Process Variables
## 4
EDGE ConnectProgrammer Reference80955039
Plasma/shield gas
Add one of the following gas selection values to these variables:
Example: G59 V505 F2 – Plasma 1, O2 plasma gas and air shield gas
Cutting surface
Add one of the following cutting surface values to these variables:
Example: G59 V536 F2 – Marker 2, cutting 3 inches below water.
1 = Above water
2 = 3 inches below water
## V505 Plasma 1
plasma/shield gas
515 Plasma 2 plasma/shield
gas
V525 Marker 1 plasma/shield
gas
V535 Marker 2 plasma/shield
gas
F1 = Air/AirF2 = O2/AirF3 = O2/O2
F4 = N2/AirF5 = N2/CO2F6 = None/N2
## F7 = O2/N2F8 = CH4 / N2F9 = H35/N2
F10 = H5/N2F11 = Air/N2F12 = N2/N2
F13 = CO2/N2F14 = None/AirF15 = CH4/Air
F16 = O2-N2/AirF17 = O2-N2/O2F18 = O2
F19 = N2F20 = N2/NoneF21 = Air
## F22 = F5/N2F23 = H35&N2/N2F24 = H17/N2
F25 = Ar/ArF26 = Ar/N2F27 = Ar/Air
F28 = F5F29 = Argon
V506 Plasma 1 cutting
surface
V516 Plasma 2 cutting
surface
V526 Marker 1 cutting
surface
V536 Marker 2 cutting
surface

## G59 Process Variables
## 4
40809550Programmer ReferenceEDGE Connect
## Material Thickness
Add one of the following material thickness values to these variables:
Example: G59 V507 F14 – Plasma 1, 1 mm thick.
The following table shows material thickness values sorted by the metric (decimal) thickness. To look up a
material thickness by the Fxx value, see the table beginning on page 52.
V507 Plasma 1 material
thickness
V517 Plasma 2 material
thickness
V527 Marker 1 material
thickness
V537 Marker 2 material
thickness
V557 Waterjet material
thickness
V564 Oxyfuel material
thickness
Metric (Decimal)Gauge and FractionFx
NoneNone1
0.35 mm (0.015 in.)28 GA2 or 3
0.40 mm (0.016 in.)27 GA4 or 5
0.50 mm (0.018 in.)26 GA6 or 7
0.55 mm (Metric only)25 GA100
0.60 mm (0.024 in.)24 GA8 or 9
0.70 mm (Metric only)23 GA101
0.80 mm (0.030 in.)22 GA10 or 11
0.90 mm (0.036 in.)20 GA12 or 13
1 mm (0.040 in.)19 GA14
1.2 mm (0.048 in.)18 GA15 or 16
1.5 mm (0.060 in.)16 GA17 or 18
1.6 mm (0.063 in.)1/16 in.19
2 mm (0.075 in.)14 GA20 or 21
2.2 mm (0.090 in.)13 GA47
2.4 mm (Metric only)3/32 in.22
2.5 mm (0.105 in.)12 GA23 or 24
3 mm (0.120 in.)11 GA48
3.2 mm (0.125 in.)1/8 in.25
3.5 mm (0.135 in.)10 GA26 or 27
3.8 mm (0.150 in.)9 GA49

## G59 Process Variables
## 4
EDGE ConnectProgrammer Reference80955041
4 mm (0.164 in.)8 GA52
4.5 mm (0.180 in.)7 GA50
4.8 mm (0.188 in.)3/16 in.28
5 mm (0.194 in.)6 GA53
5.5 mm (0.210 in.)5 GA51
6 mm (0.25 in.)1/4 in.29
7 mm (Metric only)9/32 in.102
8 mm (0.313 in.)5/16 in.30
9 mm (Metric only)11/32 in.92
10 mm (0.375 in.)3/8 in.31
11 mm (0.438 in.)7/16 in.32
12 mm (0.5 in.)1/2 in.33
13 mm (Metric only)17/32 in.103
14 mm (0.563 in.)9/16 in.34
15 mm (Metric only)19/32 in.93
16 mm (0.625 in.)5/8 in.35
17 mm (Metric only)11/16 in.104
18 mm (Metric only)23/32 in.105
19 mm (0.75 in.)3/4 in.36
20 mm (Metric only)25/32 in.106
21 mm (Metric only)13/16 in.107
22 mm (0.875 in.)7/8 in.37
23 mm (Metric only)29/32 in.98
24 mm (Metric only)15/16 in.108
25 mm (1 in.)1 in.38
26 mm (Metric only)1-1/32 in.109
27 mm (Metric only)1-1/16 in.110
28 mm (Metric only)1-3/32 in.94
29 mm (1.125 in.)1-1/8 in.39
30 mm (Metric only)1-3/16 in.111
31 mm (Metric only)1-7/32 in.112
32 mm (1.25 in.)1-1/4 in.40
Metric (Decimal)Gauge and FractionFx

## G59 Process Variables
## 4
42809550Programmer ReferenceEDGE Connect
33 mm (Metric only)1-5/16 in.113
34 mm (Metric only)1-11/32 in.114
35 mm (Metric only)1-3/8 in.41
36 mm (Metric only)1-7/16 in.99
37 mm (Metric only)1-15/32 in.115
38 mm (1.5 in.)1-1/2 in.42
40 mm (Metric only)1-5/8 in.54
44 mm (Metric only)1-23/32 in.95
45 mm (1.75 in.)1-3/4 in.43
48 mm (Metric only)1-7/8 in.55
50 mm (2 in.)2 in.44
55 mm (Metric only)2-1/8 in.56
58 mm (Metric only)2-9/32 in.96
60 mm (2.25 in.)2-1/4 in.45
64 mm (2.5 in.)2-1/2 in.46
65 mm (Metric only)2-9/16 in.97
70 mm (2.75 in.)2-3/4 in.57
75 mm (3 in.)3 in.58
80 mm (Metric only)3-1/8 in.59
85 mm (3.25 in.)3-1/4 in.60
90 mm (3.5 in.)3-1/2 in.61
95 mm (3.75 in.)3-3/4 in.62
100 mm (4 in.)4 in.63
105 mm (Metric only)4-1/8 in.64
110 mm (4.25 in.)4-1/4 in.65
115 mm (4.5 in.)4-1/2 in.66
120 mm (4.75 in.)4-3/4 in.67
125 mm (5 in.)5 in.68
130 mm (Metric only)5-1/8 in.69
135 mm (5.25 in.)5-1/4 in.70
140 mm (5.5 in.)5-1/2 in.71
145 mm (5.75 in.)5-3/4 in.72
Metric (Decimal)Gauge and FractionFx

## G59 Process Variables
## 4
EDGE ConnectProgrammer Reference80955043
The following table shows material thicknesses by Fx value.
150 mm (6 in.)6 in.73
155 mm (Metric only)6-1/8 in.74
160 mm (6.25 in.)6-1/4 in.75
165 mm (6.5 in.)6-1/2 in.76
170.0 mm (6.75 in.)6-3/4 in.77
180 mm (Metric only)7-1/8 in.79
185 mm (7.25 in.)7-1/4 in.80
190.0 mm (7.5 in.)7-1/2 in.81
195 mm (7.75 in.)7-3/4 in.82
200 mm (8 in.)8 in.83
215 mm (8.5 in.)8-1/2 in.84
230 mm (9 in.)9-in.85
240 mm (9.5 in.)9-1/2 in.86
255 mm (10 in.)10 in.87
265 mm (10.5 in.)10-1/2 in.88
280 mm (11 in.)11 in.89
290 mm (11.5 in.)11-1/2 in.90
305 mm (12 in.)12 in.91
7 in. (English only)7 in.78
FxMetric (Decimal)Gauge and Fraction
1NoneNone
2 or 30.35 mm (0.015 in.)28 GA
4 or 50.40 mm (0.016 in.)27 GA
6 or 70.50 mm (0.018 in.)26 GA
8 or 90.60 mm (0.024 in.)24 GA
10 or 110.80 mm (0.030 in.)22 GA
12 or 130.90 mm (0.036 in.)20 GA
141 mm (0.040 in.)19 GA
15 or 161.2 mm (0.048 in.)18 GA
17 or 181.5 mm (0.060 in.)16 GA
Metric (Decimal)Gauge and FractionFx

## G59 Process Variables
## 4
44809550Programmer ReferenceEDGE Connect
191.6 mm (0.063 in.)1/16 in.
20 or 212 mm (0.075 in.)14 GA
222.4 mm (Metric only)3/32 in.
23 or 242.5 mm (0.105 in.)12 GA
253.2 mm (0.125 in.)1/8 in.
26 or 273.5 mm (0.135 in.)10 GA
284.8 mm (0.188 in.)3/16 in.
296 mm (0.25 in.)1/4 in.
308 mm (0.313 in.)5/16 in.
3110 mm (0.375 in.)3/8 in.
3211 mm (0.438 in.)7/16 in.
3312 mm (0.5 in.)1/2 in.
3414 mm (0.563 in.)9/16 in.
3516 mm (0.625 in.)5/8 in.
3619 mm (0.75 in.)3/4 in.
3722 mm (0.875 in.)7/8 in.
3825 mm (1 in.)1 in.
3929 mm (1.125 in.)1-1/8 in.
4032 mm (1.25 in.)1-1/4 in.
4135 mm (Metric only)1-3/8 in.
4238 mm (1.5 in.)1-1/2 in.
4345 mm (1.75 in.)1-3/4 in.
4450 mm (2 in.)2 in.
4560 mm (2.25 in.)2-1/4 in.
4664 mm (2.5 in.)2-1/2 in.
472.2 mm (0.090 in.)13 GA
483 mm (0.120 in.)11 GA
493.8 mm (0.150 in.)9 GA
504.5 mm (0.180 in.)7 GA
515.5 mm (0.210 in.)5 GA
524 mm (0.164 in.)8 GA
535 mm (0.194 in.)6 GA
FxMetric (Decimal)Gauge and Fraction

## G59 Process Variables
## 4
EDGE ConnectProgrammer Reference80955045
5440 mm (Metric only)1-5/8 in.
5548 mm (Metric only)1-7/8 in.
5655 mm (Metric only)2-1/8 in.
5770 mm (2.75 in.)2-3/4 in.
5875 mm (3 in.)3 in.
5980 mm (Metric only)3-1/8 in.
6085 mm (3.25 in.)3-1/4 in.
6190 mm (3.5 in.)3-1/2 in.
6295 mm (3.75 in.)3-3/4 in.
63100 mm (4 in.)4 in.
64105 mm (Metric only)4-1/8 in.
65110 mm (4.25 in.)4-1/4 in.
66115 mm (4.5 in.)4-1/2 in.
67120 mm (4.75 in.)4-3/4 in.
68125 mm (5 in.)5 in.
69130 mm (Metric only)5-1/8 in.
70135 mm (5.25 in.)5-1/4 in.
71140 mm (5.5 in.)5-1/2 in.
72145 mm (5.75 in.)5-3/4 in.
73150 mm (6 in.)6 in.
74155 mm (Metric only)6-1/8 in.
75160 mm (6.25 in.)6-1/4 in.
76165 mm (6.5 in.)6-1/2 in.
77170.0 mm (6.75 in.)6-3/4 in.
787 in. (English only)7 in.
79180 mm (Metric only)7-1/8 in.
80185 mm (7.25 in.)7-1/4 in.
81190.0 mm (7.5 in.)7-1/2 in.
82195 mm (7.75 in.)7-3/4 in.
83200 mm (8 in.)8 in.
84215 mm (8.5 in.)8-1/2 in.
85230 mm (9 in.)9-in.
FxMetric (Decimal)Gauge and Fraction

## G59 Process Variables
## 4
46809550Programmer ReferenceEDGE Connect
86240 mm (9.5 in.)9-1/2 in.
87255 mm (10 in.)10 in.
88265 mm (10.5 in.)10-1/2 in.
89280 mm (11 in.)11 in.
90290 mm (11.5 in.)11-1/2 in.
91305 mm (12 in.)12 in.
929 mm (Metric only)11/32 in.
9315 mm (Metric only)19/32 in.
9428 mm (Metric only)1-3/32 in.
9544 mm (Metric only)1-23/32 in.
9658 mm (Metric only)2-9/32 in.
9765 mm (Metric only)2-9/16 in.
9823 mm (Metric only)29/32 in.
9936 mm (Metric only)1-7/16 in.
1000.55 mm (Metric only)25 GA
1010.70 mm (Metric only)23 GA
1027 mm (Metric only)9/32 in.
10313 mm (Metric only)17/32 in.
10417 mm (Metric only)11/16 in.
10518 mm (Metric only)23/32 in.
10620 mm (Metric only)25/32 in.
10721 mm (Metric only)13/16 in.
10824 mm (Metric only)15/16 in.
10926 mm (Metric only)1-1/32 in.
11027 mm (Metric only)1-1/16 in.
11130 mm (Metric only)1-3/16 in.
11231 mm (Metric only)1-7/32 in.
11333 mm (Metric only)1-5/16 in.
11434 mm (Metric only)1-11/32 in.
11537 mm (Metric only)1-15/32 in.
FxMetric (Decimal)Gauge and Fraction

## G59 Process Variables
## 4
EDGE ConnectProgrammer Reference80955047
## Water Muffler
Add one of the following water muffler values to these variables:
Example: G59 V508 F1 – Plasma 1, water muffler installed.
F1 = Installed
F2 = Not installed
Waterjet nozzle size
Add one of the following orifice size values to the variable V556.
Example: G59 V556 F30 – Waterjet, 0.03 inch nozzle
Waterjet orifice size
Add one of the following orifice size values to the variable V554.
Example: G59 V554 F10 – Waterjet, 0.010 inch orifice.
Waterjet cut pressure
For waterjet cut pressure add F60000 to the variable V558.
Example: G59 V558 F60000 – Waterjet, cut pressure 60000 psi
Fuel gas for Oxyfuel
Add one of the following torch type values to the variable V563.
Example: G59 V512 F2 – Oxyfuel, Propane fuel
V508 Plasma 1 water mufflerV518 Plasma 2 water muffler
V528 Marker 1 water mufflerV538 Marker 2 water muffler
F30 = 0.03 in.F40 = 0.04 in.
F10 = 0.010 inchF11 = 0.011 inchF12 = 0.012 inch
F14 = 0.014 inchF16 = 0.016 inch
F1 = AcetyleneF2 = PropaneF3 = Natural Gas
F4 = PropyleneF5 = Mapp

## G59 Process Variables
## 4
48809550Programmer ReferenceEDGE Connect
Oxyfuel tip type
Add one of the following torch type values to the variable V566.
Example: G59 V566 F1 – Oxyfuel, Standard tip type.
Oxyfuel tip size
Add one of the following torch type values to the variable V565.
Example: G59 V565 F3 – Oxyfuel, 4/0 tip size.
## F1 = Standard
## F2 = Divergent
## F3 = Heavy Preheat
## F4 = Divergent Heavy Preheat
## F1 = 5/0F2 = 5/0 ½F3 = 4/0
## F4 = 4/0 ½F5 = 000F6 = 000 ½
## F7 = 00F8 = 00 ½F9 = 0
## F10 = 0 ½F11 = 1F12 = 1 ½
## F13 = 2F14 = 2 ½F15 = 3
## F16 = 3 ½F17 = 4F18 = 4 ½
## F19 = 5F20 = 5 ½F21 = 6
## F22 = 6 ½F23 = 7F24 = 7 ½
## F25 = 8F26 = 8 ½F27 = 9
## F28 = 9 ½F29 = 10F30 = 10 ½
## F31 = 11F32 = 11 ½F33 = 12

## G59 Process Variables
## 4
EDGE ConnectProgrammer Reference80955049
V6xx plasma height control variables
Use the following G59 V6xx variables to select process parameters that govern torch height control.
## Plasma 1 Variables
## Plasma 2 Variables
VariableNameRange for FxExample
V600Plasma 1 Set Arc Voltage10 to 300 voltsF132
V601Plasma 1 Pierce Time0 to 9 secondsF0.5
## V602
## Plasma 1 Pierce Height
## Factor
50 to 400%F200
V603Plasma 1 Cut Height
0 to 1 in.
(0 to 25.4 mm)
## F0.13 (inch)
## V604
## Plasma 1 Transfer Height
## Factor
50 to 400%F200
V605Plasma 1 Cut Height Delay0 to 5 secondsF2.00
## V606
## Plasma 1 Kerf Detect
Reacquire Time (Sensor
THC only)
0 to 10 secondsF3.00
V607Plasma 1 Mode Select
## F1 = Manual
## F2 = Auto
## F2
V608Plasma 1 Arc Current
Amperage depends on
plasma system
V613Plasma 1 AVC Delay0 to 10 secondsF2.25
VariableNameRange for FxExample
V625Plasma 2 Set Arc Voltage10 to 300 voltsF250.00
V626Plasma 2 Pierce Time0 to 9 secondsF8.50
## V627
## Plasma 2 Pierce Height
## Factor
50 to 400%F200.00
V628Plasma 2 Cut Height
0 to 1 in.
(0 to 25.4 mm)
## F0.75
## V629
## Plasma 2 Transfer Height
## Factor
50 to 400%F200.50
V630Plasma 2 Cut Height Delay0 to 5 secondsF2.00

## G59 Process Variables
## 4
50809550Programmer ReferenceEDGE Connect
## Marker 1 Variables
## Marker 2 Variables
## V631
## Plasma 2 Kerf Detect
Reacquire Time (Sensor
THC only)
0 to 10 secondsF5.25
V632Plasma 2 Mode Select
## F1 = Manual
## F2 = Auto
## F2
V633Plasma 2 Arc Current
Amperage depends on
plasma system
V638Plasma 2 AVC Delay0 to 10 secondsF2.25
VariableNameRange for FxExample
V650Marker 1 Set Arc Voltage10 to 300 voltsF250.00
## V652
## Marker 1 Start Height
## Factor
50 to 400%F200.00
V653Marker 1 Mark Height
0 to 1 in.
(0 to 25.4mm)
## F0.75
V657Marker 1 Mode Select
## F1 = Manual
## F2 = Auto
## F2
V658Marker 1 Arc Current
Amperage depends on
plasma system
V663Marker 1 AVC Delay0 to 10 secondsF2.25
VariableNameRange for FxExample
V675Marker 2 Set Arc Voltage10 to 300 voltsF250.00
## V677
## Marker 2 Start Height
## Factor
50 to 400%F200.00
V678Marker 2 Mark Height
0 to 1 in.
(0 to 25.4 mm)
## F0.75
V682Marker 2 Mode Select
## F1 = Manual
## F2 = Auto
## F2
V683Marker 2 Arc Current
Amperage depends on
plasma system
V688Marker 2 AVC Delay0 to 10 secondsF2.25
VariableNameRange for FxExample

## G59 Process Variables
## 4
EDGE ConnectProgrammer Reference80955051
THC Index Code
Use this command to raise the Sensor THC when it is in manual mode.
## G00 Zx.xx Tx
Index Sensor THC, to height Z distance for torch T number, in manual mode only.
Sample part program using THC index code
The following sample part program includes commands to change control modes and to raise the
Plasma 1 THC height in a corner by 0.25 inches:
CodeDescription
G59 V600 F155Program arc voltage for first segment
G41Enable left kerf compensation
M07Cut on
G01 X0 Y3Linear move
G59 V607 F1Set plasma process 1 THC to manual mode
## G00 Z-.25 T1
Raise THC 1 by 0.25 inches. (A negative value raises the THC when
the positive Z-axis direction is down.)
G59 V607 F2Set plasma process 1 THC back to automatic mode
G59V600F165Program the new arc voltage for the next segment
G01 X3 Y0Linear move
M08Cut off
G40Disable kerf compensation
M02End of program

## G59 Process Variables
## 4
52809550Programmer ReferenceEDGE Connect
V8xx waterjet variables
Use V8xx variables to select process parameters for Hypertherm’s HyPrecision™ waterjet systems.
V825Pierce TypeG59 V825 Fx Dx.x Tx.x Sx.x
## F1 = Dynamic
## F2 = Circular
## F3 = Wiggle
## F4 = Stationary
## Dx.xxx = Displacement,
0.254 – 25.4 mm (0.001 – 1.0 inch)
Circle diameter for Circular pierce
Segment length for Wiggle pierce
Tx.x = Pierce time in seconds,
## 0 – 9999.99
Sxxx = Pierce speed
2.54 – 2540 mm/min
(0.1 – 100 in/min)
## G59 V825 F2 D0.1 T10 S10
## Select Circular Pierce
Ty p e   w i t h   a   c i r c l e
diameter of 0.1 inch
for 10 seconds at 10
in/min.
V827Low Pressure PierceG59 V827 Fx Tx.x Pxxxx
## F0 = OFF
## F1 = ON
F2 = Maintain until next G59 V827,
or a new cut chart is selected, or a
new part program is loaded.
Tx.x = Low pressure pierce time in
seconds 0 - 9999.99
Pxxxxx = Pump pressure 10,000 psi
to the cut pressure.
-   All other G59 variables in the part program
must come before G59 V827 F2 and the
## G04.
-   Use G04 Xx Dwell for x seconds to allow
the waterjet pump to transition to low
pressure setting.
-   Low pressure pierce time cannot exceed
the time set for normal piercing.
-   Low pressure cannot be set below
10,000 psi.
## G59 V827 F1 T5 P30000
Low pressure pierce
ON for 5 seconds at
30000 psi.

## G59 Process Variables
## 4
EDGE ConnectProgrammer Reference80955053
VariableNameRange for FxExample
V828Cut PressureG59 V828 Fxxxxxx
Fxxxxxx = pump pressure in psi
-   At this time 60000 is the only valid cut
pressure.
## G59 V828 F60000
Cut pressure set to
60000 psi
V829Pierce Motion DelayG59 V829 Fx.x
Fx.x = 0 - 9.99 seconds
## G59 V829 F3
Delay pierce motion
for 3 seconds after
## M07 Cut On.
V830Abrasive On DelayG59 V830 Fx.x or F-x.x
Fx.x = -1.0 – 5.0 seconds
## G59 V830 F3
Delay starting the
abrasive flow for 3
seconds after M07
## Cut On.
## G59 V830 F-1
Start the abrasive
flow 1 second
before the M07 Cut
## On.

## G59 Process Variables
## 4
54809550Programmer ReferenceEDGE Connect
V831Abrasive Off DelayG59 V831 Fx.x or F-x.x
Fx.x = -1 - 9.99 seconds
Abrasive Off Delay and Water
Off Delay run concurrently.
## G59 V831 F3
Delay turning off the
abrasive flow for
3 seconds after
## M08 Cut Off.
## G59 V831 F-1
Tu r n   o f f   t h e   a b r a s i v e
flow 1 second
before the M08 Cut
## Off.
V832Water Off DelayG59 V832 Fx.x or F-x.x
Fx.x = - 1 – 9.99 seconds
Abrasive Off Delay and Water
Off Delay run concurrently.
## G59 V832 F3
Delay turning off the
water flow for
3 seconds after
## M08 Cut Off.
## G59 V832 F-1
Turn off the water
flow 1 second
before the M08 Cut
## Off.
V837Cut HeightG59 V837 Fx.x
Fx.x = 0.254 - 25.4 mm (0.01 - 1.0
inch)
## G59 V837 F0.3
Set Cut Height to
0.3 inch.
V838Waterjet ModeG59 V838 Fx
## Fx =
## F1 – Q1 Rough
## F2 – Q2 Coarse
## F3 – Q3 Medium
## F4 – Q4 Smooth
## F5 – Q5 Fine
F6 – Q6 Marking - No abrasive
## G59 V838 F3
## Set Waterjet Mode
to Q3 Medium.
VariableNameRange for FxExample

EDGE ConnectProgrammer Reference80955055
XPR Part Programs
XPR program codes differ in the following two scenarios:
Basic cutting and marking (without CAM part programs or G59 codes). See Basic cutting
and marking below.
Cutting and marking with a part program outputted from computer aided manufacturing
(CAM) software, such as ProNest. See page 57.
Basic cutting and marking
Basic cutting and marking refers to each of the following scenarios:
Cut or mark without a part program created with CAM software.
Select a simple shape from the Shape Library, but cancel processing it through ProNest
## CNC.
Use a part program generated in CAM software, but DISABLE the following overrides on
the Setups > Cutting screen in Phoenix: EIA G59 Code, Process Select, EIA Kerf, and EIA
F-Code Program Code.
## 
If you are using a ProNest part program that includes marking, but you
disabled the use of G59 codes, selections on the Cut Chart screen in
Phoenix override selections in the part program. In this scenario, for
example, Phoenix interprets the M07 AR or M07 N2 in a ProNest part
program as an M09 (Marker 1 On) and uses the marking gas selected on
the Cut Chart screen.

XPR Part Programs
## 5
56809550Programmer ReferenceEDGE Connect
Basic process selection and overrides
With basic cutting and marking, you do not need to provide any codes to select or override process
parameters. Instead, you can:
Select the process on the Cut Chart screen.
## 
Select parameters at the top of the Cut Chart screen first. Based on your
selection in the top field, Phoenix limits the parameters available to select
in the fields below.
Override process parameters (by editing the values on the Process screen, Cutting screen,
or Process Data Watch Window).
## 
Process override selections cannot be saved for reuse when doing basic
cutting and marking. When the CNC reloads a cut chart, the original cut
chart values are restored and previously used overrides are lost.
The Record ID number on the Cut Chart screen refers to the record in the XPR cut chart database
for your selected process. The Process ID is a number that represents the XPR process for cutting
or marking. The Record ID and Process ID numbers cannot be edited directly. The marking process
used is selected on the Plasma 1 Cut Chart screen for XPR marking.
Basic code view
To view the part program code when doing basic cutting or marking, use the Text Editor or EIA Text
view in Phoenix (Shape Manager > Shape Wizard or Shape Manager > Text Editor).
Code definitions and exceptions
Part program codes for basic cutting and marking with XPR are included in EIA RS-274D Program
Support on page 8.
Marking with a basic part program uses legacy marking codes as follows:
M09 / M10 (Enable Marker 1 / Disable Marker 1)
M13 / M14 (Enable Marker 2 / Disable Marker 2)
M36 T3 / M36 T4 (Select Marker 1 / Select Marker 2)
For text marking information, see
Marker Font Generator on page 82.
## 
Tr u e   H o l e is not supported with basic cutting.

XPR Part Programs
## 5
EDGE ConnectProgrammer Reference80955057
CAM software part programs for XPR
XPR part programs output from ProNest (or other CAM software) support many codes in the list of
Directly Supported EIA Codes on page 9. However, there are some exceptions and additional
codes specific to XPR as explained in this section.
## 
If you have a part program that was created for an HPRXD, Hypertherm
strongly recommends that you create a new part program for XPR. For
more information, see Appendix A in Cut and Mark with an XPR on an
EDGE Connect CNC (809900).
Process selection
With XPR, one G59 command at the beginning of the CAM posted part program assigns the XPR
to Plasma 1 or 2 and tells the CNC which record in the XPR cut chart database to use. The single
cut chart record contains all of the process parameters for cutting, marking, and True Hole (when
applicable).
The standard format of a G59 command line in an XPR part program output from CAM software is
as follows:
## G59 V509 Fxxxxx
## Where:
G59 = Load a variable
V509 = Load Plasma 1*
Fxxxxx = Cut chart record ID
- If the XPR is assigned to Plasma 2, replace V509 with V519: G59 V519 Fxxxxx
Example: G59 V509 F11189 = Load Plasma 1 and use record 11189 (80 A O2/Air) in the cut
chart database
When the CNC reads the M07 (Cut On) command in the part program, the CNC sends the
process ID from record number 11189 to the XPR. The XPR and the CNC load the associated
cutting process parameters (listed below).
Cut chart process parameters loaded from the cut chart record
An operator at the CNC cannot override the cut chart parameters listed above.
## •   Arc Voltage
## •   Cut Current
## •   Cut Height
•Cut Speed
-   Gas type and
flow rate
•Kerf
## •   Pierce Height
## •   Pierce Time
## •   Transfer Height

XPR Part Programs
## 5
58809550Programmer ReferenceEDGE Connect
Process overrides
To modify an XPR part program, modify the cut chart in ProNest (or other CAM software) and output
the modified part program to use in Phoenix.
A single G59 V509 Fxxxxx command in the part program
automatically populates the XPR Process Selection fields.
An override code on the M07 line in the part
program modifies these values.

XPR Part Programs
## 5
EDGE ConnectProgrammer Reference80955059
Process override codes
CAM software, such as ProNest, adds process override codes to the M07 line in XPR part
programs. These codes indicate which standard value from the cut chart record to override with the
specified value. See Ta b l e   1.
Table 1– Process parameter override codes
## Examples:
M07 AVO116 = Cut On and use an arc voltage of 116 (instead of standard arc voltage
value from the cut chart record referenced on the G59 line).
M07 AVD5= Cut On and delay automatic voltage control by 5 seconds.
## 
Make sure that the following Program Code settings are enabled on the
Cutting screen in Phoenix (Setups > Cutting): EIA G59 Code Override,
Process Select Override, EIA Kerf Override, and EIA F-Code Override.
Override codeDescriptionValid range
AVOArc Voltage Override50 VDC – 300 VDC
AVDArc Voltage Delay Override*0.01 second – 10 seconds
CCOCut Current Override
-100% through +200% when current is
less than 30 A, otherwise ±100%
CHDCut Height Delay Override1 – 10 seconds
CHTCut Height Override0.02 inch – 2 inches
MAFMix AR Flow Override±50%
MHFMix H2 Flow Override±50%
MNFMix N2 Flow Override±50%
PCFPlasma Cut Flow Override±100%
PHTPierce Height Override**
50% – 400% of cut height (specified as an
absolute value in inches or mm)
PJHPuddle Jump Height Override
50% – 500% of cut height (specified as an
absolute value in inches or mm)
PTOPierce Time Override0.001 second – 10 seconds
SCFShield Cut Flow Override±100%
SPFShield Pierce Flow Override±100%
THTTransfer Height Override**
25% – 400% of cut height (specified as an
absolute value in inches or mm)
- Also called automatic voltage control (AVC) delay.
** See page 60.

XPR Part Programs
## 5
60809550Programmer ReferenceEDGE Connect
Process overrides applied on the M07 line remain in effect until the next M07 command which reloads the
standard cut chart values.
Pierce height and transfer height overrides
Pierce height and transfer height are defined in the cut chart as absolute values (in inches or
millimeters). For XPR, pierce height and transfer height overrides are independent of cut height.
Example: M07 CHT0.5 THT0.25 = Cut On, use a 0.5 inch cut height, and use a 0.25 inch transfer
height
The CHT and THT override values are used instead of the cut height and transfer height values from
the cut chart record referenced on the G59 line. PHT is not included on the M07 line in the above
example, so the pierce height value from the cut chart record referenced on the G59 line is used.
V6xx codes
Prior to the release of the XPR plasma power supply, process overrides were applied with G59
V6xx Fvalue codes. Instead of using a part program that contains legacy V6xx codes with XPR,
replace the entire part program using CAM software.
## 
V600 and V607 height control override codes are still supported in XPR
for bevel cutting. However, the V6xx code must appear below the M07
(Cut On) command in the part program. No other V6xx override codes are
supported with XPR.

XPR Part Programs
## 5
EDGE ConnectProgrammer Reference80955061
Marking codes
The marking codes used in XPR part programs created with CAM software, such as ProNest, are
defined in Ta b l e   2. These codes differ from the marking codes that are used with other plasma
power supplies and when doing basic marking with XPR. All cutting process parameters from the
cut chart record will be used unless a process or marking override appears on the M07 line.
Table 2– Marking codes and definitions specific to XPR part programs output from CAM software
EIA codeResult with XPR
## M07 N2
Enables marking with Nitrogen
## M07 AR
Enables marking with Argon
## M07 N2 HS
## OR
## M07 AR HS
With XPR, forces an IHS for marking, regardless of the distance between marks or
any previous M08 command.
## M36 T1
Select Plasma 1 process (for cutting and marking).
## 
M36 T1 must appear before G59 V509 Fxxxx. See
page 57.
## M36 T2
Select Plasma 2 process (for cutting and marking).
## 
M36 T2 must appear before G59 V519 Fxxxx. See
page 57.
## Fx
Indicates marking speed (when x is replaced with the marking speed).
The marking speed may be the value from the cut chart or an override value (if speed overrides
are enabled and you specified a marking speed override in the cut chart in your CAM
software).
## Example:
## M07 N2
## F250.
## 
Fx must appear below the M07 AR or M07 N2 line.
## M08
M08 disables cutting and marking.
M08 only disables marking if the marking override appears on the M07 line.

XPR Part Programs
## 5
62809550Programmer ReferenceEDGE Connect
Marking text
If you are marking text, refer to Text Marking with ProNest and Phoenix (Application Note 809850)
available at www.hypertherm.com/docs
## .
Legacy marking codes
Part programs for marking with XPR that are created with CAM software, such as ProNest, do NOT
include the following codes that are used for marking with HPRXD:
Marker offsets (Only supported when using a third party marking tool or drill.)
M09 / M10 (Enable Marker 1/ Disable Marker 1)*
M13 / M14 (Enable Marker 2 / Disable Marker 2)*
M36 T3 / M36 T4 (Select Marker 1 Process / Select Marker 2 Process)*
-  These codes are supported in XPR part programs when doing basic cutting or marking. See page 55.
## 
If you have a part program that contains the above legacy codes,
Hypertherm recommends that you create a new part program
specific to XPR.
## 
There is a manual way to use a legacy part program to mark M09 codes
with oxyfuel powder and cut M07 codes with XPR. For more details, refer
to Mark with Oxyfuel Powder and Cut with XPR with Legacy Part
Programs (Application Note 811230).
## M08 RF
Retracts to Full Retract height at the end of a cut or mark.
Works only with Sensor THC.
M08 RT –x.xx
If the skip IHS distance is >0, retracts to the Transfer Height (instead of the Retract
Height) and skips IHS at the end of a cut or mark.
The –x.xx variable represents the amount of time before the end of a cut or mark that
the Cut Off (also the Marker Off) command is issued.
## M08 Txx.xx
Cut Off or Marker Off with time delay.
T = Temporary Optional Time Delay from –1 to 99.99 seconds
Marker offsets
The marker offset commands provided in the Directly Supported EIA Codes on
page 9 are not supported for XPR Marking done with Plasma 1 and Plasma 2.
EIA codeResult with XPR

XPR Part Programs
## 5
EDGE ConnectProgrammer Reference80955063
True Hole codes
ProNest adds the TH code on the M07 (Cut On) command line to tell Phoenix and the XPR to
override the standard cutting process parameters with True Hole cutting process parameters (on
True Hole-compatible circles only).
Example: M07 TH
A ProNest part program also automatically applies varying speeds across multiple hole segments to
complete the True Hole technique.
Interior contour codes
For parts with interior contours such as slots, arcs, or holes that are not True Hole-compatible, CAM
software includes the O2S code on the M07 (Cut On) command line. The O2S code tells Phoenix
and the XPR to override the standard cutting process parameters with the O2/O2 cutting process
parameters from the cut chart record.
Example: M07 O2S
THC Index Code
XPR part programs do not have unique THC index codes. See page 51 for information about THC
index codes.
XPR part program format guidelines and examples
Hypertherm CNCs require that certain codes be in specific positions in the part program.
Here are some guidelines on the order of codes in XPR part programs output from ProNest and
other CAM software:
Process selection: A G59 V5xx Fxxxxx code is included at the beginning of the part
program to select the cut chart record (which contains all process parameters for cutting,
marking, and True Hole if applicable).
The G59 command must precede the G41 or G42 code.
Once the program selects the cut chart, the G59 V5xx code does not need to be
re-issued unless the program requires a change in process (a new cut chart).
Kerf compensation: The G41 (Enable Left Kerf Compensation) or G42 (Enable Right Kerf
Compensation) must immediately precede the M07 command line.

XPR Part Programs
## 5
64809550Programmer ReferenceEDGE Connect
Cutting tool activation: Each cut or mark in the part starts with M07 (Cut On) or
M07 AR/N2 (Marker On) and ends with M08 (Cut Off or Marker Off).
With XPR, the marking tool is also the cutting tool.
The M07 command must appear after the G41 or G42 kerf compensation command.
Process overrides: All cutting process parameters from the cut chart record will be used
unless a process or marking override appears on the M07 line. See Process overrides on
page 58 and Marking codes on page 61.
## 
Legacy G59 V6xx Fxx codes (described on page 60) must appear below
the M07 (Cut On) code in the part program. Otherwise, the M07
command will overwrite the override value with the value from the cut
chart.

XPR Part Programs
## 5
EDGE ConnectProgrammer Reference80955065
Sample XPR cutting part program
Below is a sample part program that was output from CAM software to cut a circle with XPR.
## G20
## G91
(CutPro Wizard - Load Material: Mild Steel;5.1698" x 5.4627";1.")
## M36 T1
## M37 T1
## G00Y0.2929
## G59 V509 F11956
(130Amp O2/Air)
## G43X0.161
## G41
## M07 HS
## M51
## F20.
## G03X1.4142Y1.4142I0.7071J0.7071
## G02I1.5556J1.5556
## M50
## G03X-0.7071I-0.3536J-0.3536
## M08
## G40
## M51
## M19
## M02
Loads record 11956 (130 A O2/Air) in the cut chart database on Plasma 1
Enables cutting and forces IHS

XPR Part Programs
## 5
66809550Programmer ReferenceEDGE Connect
Sample XPR marking part program
Below is a sample part program that was output from CAM software to mark a circle with XPR.
## G20
## G91
(CutPro Wizard - Load Material: Mild Steel;4.4" x 4.4";1.")
## M36 T1
## M37 T1
## G00Y2.2
## G59 V509 F11956
(130Amp O2/Air)
## M07 HS N2
## M51
## F250.
## G02I2.2J0.
## M50 H-0.02
## G01Y0.25
## M08
## M19
## M02
## 
XPR uses Plasma 1 and Plasma 2 for cutting and marking.
Loads record 11956 (130 A O2/Air) in the cut chart database on Plasma 1
Forces IHS and enables marking with Nitrogen

EDGE ConnectProgrammer Reference80955067
## Advanced Feature Codes
## Kerf Table Codes
Special Kerf and G59 Code Settings
## Kerf Override
By default, this option is enabled. If the parameter is disabled, all kerf value codes (G41 X, G42 X,
G43 X, etc.) are ignored. The Load Kerf Table variable is also ignored. This parameter cannot be
changed while the part program is paused.
## G59 Code Override
By default, this option is enabled. If the parameter is disabled, all G59 codes are ignored. The
parameter cannot be changed while the part program is paused.
CodeDescription
G59 D1-200XxxSets kerf table variable from 1 – 200
G41 D1-200Enables Left Kerf using a Kerf Table variable
G42 D1-200Enables Right Kerf using a Kerf Table variable
G43 D1-200Changes current kerf value via Kerf Table using previously set left or right kerf

## Advanced Feature Codes
## 6
68809550Programmer ReferenceEDGE Connect
Parallel Kerf Enable for Hole Center Piercing
This parameter allows the kerf to be enabled in parallel with the first segment of cut motion that
follows the Enable Kerf command. Kerf location is interpolated in parallel with the first cut segment
so that the kerf offset is reached by the end of the first cut segment. The overall effect on a radial
lead-in is to turn it into a spiral lead-in. This parameter allows all current part programs and nests to
take advantage of parallel kerf enable without being re-posted. Enable or disable this feature in the
Status / Program Code section of the Cutting screen.
## 
Make sure Parallel Kerf Enable is disabled for True Hole
## ®
part programs.
## Tilt / Rotator Part Codes
CodeDescription
G00 AvalueSets tilt angle as a preparatory command – A is the angle value in degrees
G00 XYvalue AvaluePerforms Linear Interpolation of Tilt angle along line segment.
G00 Avalue FvalueSets tilt angle – Angle value in degrees with a speed command in RPM
M28Disables Follower
M29Enables Follower
M90Preparatory Cmd – Aligns Rotator to Tangent angle of next cut segment
M90-Align rotator when not using shortest path motion
M75 A axis/Tilt Goto Home Cmd – Rapid Index
G00 CxxMove to rotate C position
G01 Cxx FxxMove to rotate C position with Speed “F” command
G00 C180-Rotate Axis align 180 degrees will continue to rotate in the proper direction
G00 C-180-Rotate Axis align -180 degrees will continue to rotate in the proper direction
G01 C180- Fxx Rotate Axis align 180 degrees with speed
G01 C-180- FxxRotate Axis align -180 degrees with speed

## Advanced Feature Codes
## 6
EDGE ConnectProgrammer Reference80955069
## Station Select Codes
Stations (Lifter and THCs) can be selected and deselected using the following EIA-274D program
codes. To override the part program, enable Process Select override and Station Select Override in
the Status / Program Code section of the Cutting screen.
Additionally, these Station Select program codes can be overridden with the station inputs to the CNC.
## Process Select Codes
Process selections can be made using a EIA-274D program code in the following format.
## Example: M36 Tx
M36 = Select Process
Tx = Process name, where:
T1 = Plasma Process 1
T2 = Plasma Process 2
T3 = Marker Process 1*
T4 = Marker Process 2*
T6 = Waterjet
- For XPR part programs, see Marking codes on page 61.
## Automatic Plate Alignment Codes
Three point alignment distance and speeds can be defined with the following EIA format program
code:
## G66D100B300C30
## Where:
G66 = 3-point alignment command
Dxx = Distance between two plate edge reference points
Bxx = Rapid feed rate for distance (D) motion
Cxx = Slow feed rate for the distance to the edge
CodeDescription
M19 TvalueCancel All Station Selections
M37 TvalueSelect Station 1- 20 (Tvalue)
M38 TvalueDeselect Station 1- 20 (Tvalue)

## Advanced Feature Codes
## 6
70809550Programmer ReferenceEDGE Connect
## Automatic Torch Spacing
The automatic torch spacing feature uses part program codes and CNC outputs to position cutting
stations for multiple torch cutting processes.
To enable Automatic Torch Spacing:
1.Choose Setups > Password > Machine Setups and choose ON for Automatic Torch Spacing.
Save the values.
2.In the Cutting screen, under Status and Program Code, set Auto Torch Spacing Override to
## Enabled.
In this process, the primary torch station has a fixed mount to the transverse axis and the other
secondary torch stations have the ability to clamp to the mechanics of the transverse axis during use
or lock to the gantry or beam when not in use.
For the example, in the following illustration, Torch 1 is the primary station and Torch 2-4 are the
secondary stations.
Typical use is as follows:
1.Unclamp and unlock all stations (except the first which is fixed and slides the others).
2.Go to Home Command on Transverse Axis (M77 or M78 depending on orientation).
3.Clamp and Unlock all carriages and G00 index inward on transverse (optional command - may
be used to space all stations away from edge / OT switch of machine).
## CNC
## Cutting
## Gantry

## Advanced Feature Codes
## 6
EDGE ConnectProgrammer Reference80955071
4.Lock and Unclamp all and G00 index to space first station (remember-first station has no
clamping/locking on board).
5.Unlock and Clamp next station and G00 index to space the next station.
6.Repeat step 5 until as many stations as needed are spaced.
## 
Homing also automatically includes the commands necessary to push the
stations to the side and lock or clamp them whenever the transverse is
homed, if Auto Torch Spacing is enabled. Unclamp / Clamp and
Unlock / Lock commands execute a one second delay before moving.
## CNC
## Gantry
## Cutting
## CNC
## Gantry
## Cutting

## Advanced Feature Codes
## 6
72809550Programmer ReferenceEDGE Connect
## Automatic Torch Spacing Program Codes
Automatic Torch Spacing I/O
Station Lock 1–19: Locks the unused torch station to the gantry or beam when not in use.
Station Clamp 1–19: Clamps the selected torch station to the transverse axis for standard cutting.
Station Mirror 1–19: Clamps the selected torch station to the transverse axis for mirrored cutting.
## Example Part Program
The transverse axis is configured as the X axis.
Three station cut of 20 inch vertical rip.
CodeDescription
M32Unclamp / Unlock All Stations
M33Unclamp / Lock All Stations
M34Clamp / Unlock All Stations
M34TxxClamp / Unlock T Station, where T = 1 through 19
M35Clamp / Unlock All Stations Mirror
M35TxxClamp / Unlock Mirror T Station, where T = 1 through 19
M77Go to Home position Y Axis
M78Go to Home position X Axis
G00 Xxx YxTraverse command where x = value to move the desired axes a distance.
CodeDescription
G70English Units
G91Incremental Mode
G99 X1 Y0 I0 J0Axes Preset zero Scaling
M32Unclamp / Unlock All Stations
M78Home X Axis (move all stations to Home position)
M34Clamp All / Unlock All
G00X2Y0Traverse X axis 2 inches (to move off edge/switch)
M33Unclamp All / Lock All
G00X10Y0Traverse X axis 10 inches (to set 10 inch space – station 1)

## Advanced Feature Codes
## 6
EDGE ConnectProgrammer Reference80955073
Dual Transverse cutting
The EDGE Connect supports dual transverse without beveling on cutting machines. See the Dual
Transverse Setup and Operation Application Note (807610) on Hypertherm.com for more
information.
To set up this type of table:
1.EtherCAT drives should be set up in the following physical order:
## 1: Rail
## 2: Transverse
## 3: Dual Gantry
4: Sensor THC1
## 5: Dual Transverse
6: Sensor THC2 (if a second THC is used)
2.After these drives and axes are set, enable dual transverse. From the Main screen, select
Setups > Password and enter the NRT password (no rotate and tilt).
## 
The NRT password allows the use of dual transverse axis without dual
bevel axes systems. The RT password reverses this setup.
3.The measurement units (English or metric) that are used in the drives must match the units that
are used in the CNC.
4.Park Dual Head 1 and Park Dual Head 2 are both required I/O points that must be assigned for
either Park Dual Head 1 or Park Dual Head 2 to function.
M34 T1Clamp Station 1 / Unlock Station 1
G00X10Y0Traverse X axis 10 inches (to set 10 inch space – station 2)
M34 T2Clamp Station 2 / Unlock Station 2
G41Left Kerf
M07Cut On
G01 X0 Y20Line segment (Y axis 20 inches)
M08Cut Off
G40Kerf Off
M02End of Program
CodeDescription

## Advanced Feature Codes
## 6
74809550Programmer ReferenceEDGE Connect
## Beveling
Hypertherm supports several software beveling options. The following sections describe the
software beveling options available. Hypertherm does not support the mechanical design of bevel
heads.
Contour Bevel Head for Oxyfuel Cutting (CBH)
The CBH axis supports a rotational motion bevel for oxyfuel cutting process. There is no tilting axis
with CBH. The CBH axis is either set up on Axis 3 or Axis 4, depending on whether dual gantry or
Sensor THC axes are enabled and assigned to Axis 3. The beveling codes M28, M29, M90, and
M76 (described in the M and G Codes Used for Beveling section), can be used with CBH. A CBH
axis cannot be defined when tilt rotator or dual tilt rotator axes are enabled on the Machine
Setups screen.
The program code M90 is typically used at the beginning of a part program to align the rotational
axis before cutting begins. The M76 code is used at the end of the part program to bring the CBH
back to its rotational home position.
## Tilt Rotator Plasma Bevel
The tilt rotator is assigned to Axes 5 and 6 and supports plasma beveling. The preferred tilt rotator
settings include No Scaled Rotator, No Dual Tilting Rotator and No Transformation. These are the
simplest settings and work well for bevel mechanical designs in which the torch center point is
directly in line with the tilt and rotate axes.
Some plasma bevel designs require that the rotator motion be scaled. The Scaled Rotator setting
allows the rotational axis motion to be scaled directly by this parameter. It is the responsibility of the
machine/bevel designer to determine the value for this setting, if it is required.
Some plasma bevel designs require dual tilting axes. Dual Tilting Mode 1 is used for most standard
dual tilting systems where both tilt axes move through +/- 45 degrees to achieve the desired tilt and
rotation motions. Mode 2 is a special form of dual tilting axis in which special equations control the
motion. If Dual Tilting mode is needed, and special equations are needed, the machine/bevel
designer must calculate and provide them. Hypertherm determines the amount of time that is
required to add these equations to a new Dual Tilting mode for the customer.
Note that BACF, described in the Bevel Angle Change on the Fly (BACF) section, is not supported
for dual tilting bevel designs. In addition, even though both axes are dual tilting, they are still referred
to as rotate and tilt axes on all screens, as the effective motions are still rotation and tilt.
Some plasma bevel designs require a transformation of the rotate and tilt axes motion to achieve the
proper motion. The transformation allows the torch to be at the correct bevel angle and orientation
to the cut for the given bevel mechanical design. The machine/bevel designer must provide these
equations if they are needed. Hypertherm determines the amount of time that is required to add
these equations to a new Transformation mode for the customer. See Bevel Angle Change on the
Fly (BACF) on page 76 for more information.

## Advanced Feature Codes
## 6
EDGE ConnectProgrammer Reference80955075
The beveling codes M28, M29, M90, M75, and M76 can be used with tilt rotator. See M and G
Codes Used for Beveling on page 76 for more information.
M90 is typically used at the beginning of the part to align the rotational axis before cutting begins.
M75 and M76 are used at the end of the part to bring the tilt rotator back to its vertical home
position.
## Dual Tilt Rotator Plasma Bevel
The dual tilt rotator is assigned to Axes 8 and 9 and supports a second plasma beveling system. All
of the settings described in the Tilt Rotator Plasma Bevel section also apply to the dual tilt rotator.
In addition, the dual tilt rotator can also have its own dual transverse axis assigned to Axis 7. When
there is a dual transverse axis assigned, the two plasma bevel systems are homed to opposite sides
of the machine. The dual transverse axis allows the two transverse axes to be independently parked
and unparked, spaced, and mirrored to each other using the M84 through M92 commands
described in M and G Codes Used for Beveling.
Include the following code sequences in your torch spacing part programs:
M91Yxx – Moves Head 2 Yxx inches from Bevel Head 1
M92Yxx – Moves Head 1 Yxx inches from Bevel Head 2
These spacing commands establish a relative spacing between the heads regardless of where the
heads are actually located. Only one of these commands should be used at one time. If Head 1
needs to be at a specific position before head 2 is positioned in relation to Head 1, then the
command sequence is:
M89 – Park Head 2
G01 Yxx – Move Head 1 to actual coordinate
M88 – Unpark Head 2
M91Yxx – Space Head 2 in relation to Head 1 by Yxx inches
M02 – End Program – Used if this is a standalone Torch Spacing program
Likewise, if Head 2 needs to be at a specific position before Head 1 is positioned in relation to
Head 2, then the command sequence is:
M87 – Park Head 1
G01 Yxx – Move Head 2 to actual coordinate
M86 – Unpark Head 1
M92Yxx – Space Head 1 from Head 2 by Yxx inches
M02 – End Program – if this is a standalone torch spacing program

## Advanced Feature Codes
## 6
76809550Programmer ReferenceEDGE Connect
Bevel Angle Change on the Fly (BACF)
BACF allows the tilt axis to change position in parallel with X and Y motion, instead of only in a
preparatory G00 'Axx' command. 'G01,02,03 X Y I J Axx' is supported for true rotate and tilt bevel
mechanical designs. BACF is not supported for dual tilting bevel mechanical designs.
The 'Axx' command (where xx = the bevel angle) executes in parallel with X and Y motion. The
A angle is reached at the end of the segment.
All BACF motions are only performed if the maximum speed of the appropriate axis is not exceeded
by excess X and Y speed, or by Max Tilt or Rotator Max speeds that are too low.
RACF – Rotate Angle Change on the Fly
RACF allows rotate angle change on the fly interpolated along with X, Y motion so that cuts can be
made on more than one side of a square tube when it is rotated during the cut. The THC must be
able to respond to the arc voltage fast enough during the tube rotation.
G01,02,03 X Y I J Cxx is the command that is used.
The transverse backs up or moves ahead to account for the change in part location due to the CBH
or rotary axis tube rotation.
M and G Codes Used for Beveling
The following lists of the M and G codes can be used for beveling.
Kerf Table Commands to Change Kerf During Multi-pass, Multi-bevel Cuts
G59 D(1-200) Xvalue: Sets the kerf table variable from 1-200
G41 D(1-200): Enables the left kerf using a kerf table variable
G42 D(1-200): Enables the right kerf using a kerf table variable
G43 D(1-200): Changes the current kerf value via kerf table using previously set left or right kerf
Tilt/Rotator Commands
G00 Aangle in degrees: Sets Tilt angle as a preparatory command
G01 X Y Aangle in degrees: Performs Tilt BACF
M28: Disables follower
M29: Enables follower
M90: Aligns rotator to tangent angle of next cut segment
M75: A axis/tilt go to home command –  rapid index

## Advanced Feature Codes
## 6
EDGE ConnectProgrammer Reference80955077
M76: C axis/rotate go to home command – rapid index
Dual Tilt/Rotator Commands Used with Dual Plasma Bevel Systems
M84: Disable mirror Head 2
M85: Enable mirror Head 2
## M86: Unpark Head 1
## M87: Park Head 1
## M88: Unpark Head 2
## M89: Park Head 2
M91 Yxxxx: Space Head 2 xxxx millimeters
M92 Yxxxx: Space Head 1 xxxx millimeters
Tube cutting with bevel command
G00 or G01 Px Ax Tx  Sx Rx Xx or Yx  Rotate Transverse 2 axis for square or rectangular tube
cutting.
P = +/- 180 degrees
A = Tilt angle
F = Rotational speed in RPM (optional only for G01. Not used for G00)
T = Top measurement of tube
S = Side measurement of tube
R = Corner radius, +/- 90 degrees
X or Y = Optional: Rail axis position
Drilling and Tapping using a PLC
EDGE Connect and Phoenix now support a software PLC called PLC Connect. For information on
PLC Connect, refer to the PLC Connect Application Note (809570) available at
www.hypertherm.com/docs
## .
## All Possible Axis Assignments
Axis 1 – Transverse or Rail
Axis 2 – Rail or Transverse

## Advanced Feature Codes
## 6
78809550Programmer ReferenceEDGE Connect
Axis 3 – Dual Gantry, CBH or Sensor THC
Axis 4 – CBH or Sensor THC
Axis 5 – Rotate or Sensor THC
Axis 6 – Tilt or Sensor THC
Axis 7 – Dual Transverse or Sensor THC
Axis 8 – Dual Rotate or Sensor THC
Axis 9 – Dual Tilt or Sensor THC
Axis 10 – Sensor THC
Axis 11 – Sensor THC
Axis 12 – Sensor THC
## Special Passwords
NRT – No Rotate Tilt
The NRT password allows you to use a dual transverse axis without physically having the tilt rotator
and dual tilt rotator drives and motors. The Tilt Rotator Axes screens are still visible, but are not
used. They are typically used when non-bevel 2-torch servo spacing with vertical cutting is needed
with a dual transverse. This password remains in effect after the CNC is powered off.
RT – Rotate Tilt
The RT password re-enables the use of the tilt rotator and dual tilt rotator drives and motors with a
dual transverse system. This password is needed only if the NRT password has previously been
used. This password remains in effect after the CNC is powered off.
1RT - 1 Rotate Tilt
The 1RT password enables the Rotate and Tilt axes but not Dual Rotate and Dual Tilt axes. 1RT can
also be used to add a second station for I-cutting on a cutting machine that also supports a bevel
head.

EDGE ConnectProgrammer Reference80955079
## Subparts
Subparts allow you to call and execute a separate part file within a part program using a simple line
of text.
To configure a subroutine part for use, the user must first create a folder on the CNC hard drive
named “SUBPARTS”. To create a folder on the hard drive, select Load From Disk. With the folder
location highlighted, press the + key to create a new folder.
Save the part program in the SUBPARTS folder.
To execute the part, insert a line of code within the part program with the following format.
## PFILENAME
Start the line of code with the letter P to indicate that a Sub Part is to be executed, followed by the
filename for the desired part program.

## Subparts
## 7
80809550Programmer ReferenceEDGE Connect
For example, to execute subpart L-Bracket after completing a simple 5" x 5" square with a
programmed traverse, the part program would look something like the following example:
(Rectangle – Piece)
## G20
## G91
## G99 X1 Y0 I0 J0
## G41
## M07
## G01 X-5.2 Y0
## G01 X0 Y5
## G01 X5 Y0
## G01 X0 Y-5.2
## M08
## G00 X.75 Y0
## PL-BRACKET
## G40
## M02

## Subparts
## 7
EDGE ConnectProgrammer Reference80955081
When it is executed, this program will be represented as the original part plus the additional subpart
and will include the programmed traverse.
## 
Subparts can also contain subparts. After being translated by the CNC,
the final text of the part will contain the complete text of the original part
and subpart.

EDGE ConnectProgrammer Reference80955082
## Marker Font Generator
The Marker Font Generator (also called the Phoenix Text Marker) labels or identifies parts with a
marking device before cutting. This is accomplished by use of a simple command string within the
part program code to call existing English text characters (fonts) and execute marking of the
selected text.
## 
If your marking job requires non-English text or asynchronous stops, do
not use the Marker Font Generator. Instead, use ProNest Scribe Text. See
kb.hyperthermcam.com/.
Marker Font Generator program code
The Marker Font Generator program code uses a specific command string format to provide
information on the marker font source location, scale factor, angle, marker tool, tool offset and text.
Each section or information block in the command string is separated by a space. The format and
definition of each command code is outlined in Ta b l e   3 on page 83.

## Marker Font Generator
## 8
EDGE ConnectProgrammer Reference80955083
Table 3–  Marker Font Generator command codes and default values
## 
If a value is not present for a specific information block, the default values
will be used.
Sample marking tool command string:
<F1 S1 A0 M1 O1 R1 <TEST 123> or <R1 <TEST 123>
Sample command string for HPR or any cutting tool other than XPR:
## <F1 S2 A45 M1 O0 R1 G1 V100 <TEST 123>
Sample XPR command string:
## <F1 S2 A45 M0 O0 R1 G1 V100 <TEST 123>
## Where:
<: The program command must begin with the “<” symbol to indicate that the Marker Font
Generator feature is being used.
F: The first block of information is the Font Source location. The “F” is followed by a digit to indicate
the location where the font is stored:
1 = an internal font in the control software (All CAPS)
2 = a font located on the CNC hard drive
3 = a font from diskette or USB memory
If no font is found at the selected location, the default internal font will be used. For the
example given, the font location would be from the hard drive.
S: The second information block determines the scale of the text. The “S” is followed by a number
that indicates the scale factor. This number can be a decimal value. For the HPR and XPR examples
given, the scale factor is twice the original font dimensions.
CodeCommandDefault ValueNote
FxFont1= Internal (always ALL CAPS)
SxScale1.0
AxAngle0.0
MxMarker1 = Marker 1
For XPR, use 0.
OxOffset1 = Marker Offset 1
When cutting and
marking with the same
tool, set the offset to 0
## (O0).
RxRetract0 = No Retract to Transfer
GxGas0 = No XPR Marking Gas
Only required with XPR.
VxSpeed0 = No F-Code Override

## Marker Font Generator
## 8
84809550Programmer ReferenceEDGE Connect
A: The third information block determines the angle of the text. The “A” is followed by a number that
indicates the degree of angle. This number can be a decimal value. For the HPR and XPR examples
given, the degree of the angle is 45.
M: The fourth information block determines the Marker Tool to be used. The “M” is followed by the
number of the marker tool (Marker Enable Output) to use. Up to two marker enables are supported.
For XPR, use 0 (M0).
O: The fifth information block determines the tool Offset. The “O” is followed by a number to indicate
to use one of the nine different tool offsets previously configured in control setups. The marking tool
command string example on page 83 indicates that tool offset number 1 should be used.
## 
When cutting and marking with the same tool, set the offset to 0 (O0).
R: The sixth information block determines if a Retract to Transfer is used at the end of each segment
of the marked text. The "R" is followed by a number to indicate the type of retract:
0 = retract to the Retract Height value* at the end of each segment
1 = retract to Transfer Height on all text string segments, except for the last segment which
retracts to the Retract Height value* before moving to the next location on the plate
2 = retract to Transfer Height at the end of all segments
- Specify the Retract Height value on the Process screen in Phoenix.
G: The seventh information block determines the type of marking gas used for XPR marking. The
"G" is followed by a number to indicate the type of gas:
0 = none
1 = argon
2 = nitrogen
V: The eighth information block determines if the default marking speed is overridden with another
speed. The "V" is followed by a number to indicate the new marking speed. Zero indicates that the
default marking speed will be used. This number can be a decimal value.
< >: The final information block is used to specify the marker text to be executed. The text must be
enclosed in the “<” and “>” marks to be valid and understood as the selected text. For the example
given, the marker text executed would be “TEST 123”.
To improve the ease of use for the part program designer and control operator, the marker font
generator always inserts a traverse segment to return to the original start point at the beginning of
the marking text.

## Marker Font Generator
## 8
EDGE ConnectProgrammer Reference80955085
## Examples
Marking tool example
When the marking tool code example <F1 S1 A0 M1 O1 R1 <TEST 123> is translated by the
CNC, it generates the Marker Text “TEST 123” on the plate as shown here in Shape Wizard
## TM
## .
## 
Shape Wizard is only intended for previewing marker text. To  e d i t  m a r k e r
text, use the Phoenix Text Editor (Shape Manager >  Te x t   E d i t o r). The
Shape Wizard does not currently support all marker text command codes.

## Marker Font Generator
## 8
86809550Programmer ReferenceEDGE Connect
XPR example
Here is an example of how the part program for a rectangle appears in the Phoenix Text Editor when
you add the following marker font generator command: <F1 S2 A45 M0 O0 R1 G1 V100 <TEST
## 123>.
Marker Font Generator font options
## Internal Fonts
The internal fonts located within the control software are 1-inch high and are limited to characters
available on the control keypad. Alphabetical characters are limited to upper case (ALL CAPS)
letters only.
## External Fonts
External fonts can be loaded from a memory stick or from the hard drive. When the CNC generates
the text, the CNC searches for part files to correspond to the selected character. The part file names
must be based on their ASCII numeric equivalent and have a *.txt file extension.
For example, for the marker text “Ab 12”, the control searches for the following files to generate the
text:
TextASCII No.File Name
Capital A65ASCII65.txt
Lower case b98ASCII98.txt
Space32ASCII32.txt
No 149ASCII49.txt
No 250ASCII50.txt

## Marker Font Generator
## 8
EDGE ConnectProgrammer Reference80955087
For more information on ASCII codes, refer to the ASCII Codes on page 26.
Font programs may be saved on the control hard drive by creating a folder labeled “Fonts” using the
“Save to Disk” feature and saving the font programs within this folder. Remember, if a
corresponding part file to text requested is not found at the selected source location, the internal
font file will be used.
## Custom Fonts
Custom fonts can be used when using the marker font generator. To construct these font files, use
the following guidelines:
Programming format must be EIA. See page 9.
Only M09 and M10 can be used to enable and disable the marker, except in part programs
for XPR output from CAM software
## .
## 
ProNest part programs for XPR use M07 AR or M07 N2 to enable
marking and M08 to disable marking. See page 61 for details.
Only G00, G01, G02 and G03 codes can be used.
The program must end in an M02.
The proper file name must be assigned to the font program. See the letter “B” example and
refer to the table on page 86.
The font program must begin in the lower left and end in the lower right.
Font programs should have the consistent dimensional limits (i.e. 1 inch high).

## Marker Font Generator
## 8
88809550Programmer ReferenceEDGE Connect
Example: The letter “B” – File Name Ascii66.txt
## M09
## G01 X0 Y1
## G01 X0.321429 Y0
## G02 X0 Y-0.5 I0 J-0.25
## G01 X-0.321429 Y0
## M10
## G00 X0.321429 Y0
## M09
## G02 X0 Y-0.5 I0 J-0.25
## G01 X-0.321429 Y0
## M10
## G00 X0.571 Y0
## M02
The darker lines in the drawing represent the Traverse segment, and the lighter lines represent the
Marking lines. You can see by this illustration that at the end of the font program, a traverse is used
to continue motion to the bottom right corner.
## 
The Burny 3/5 style of programming for the Marker Font Generator feature
is also supported for the default internal font source.

EDGE ConnectProgrammer Reference80955089
EoE Command Messages
To operate Inkjet or Dot Peen marking systems and other external Internet Protocol (IP) devices, the
## EDGE
## ®
Connect CNC sends command messages through EoE (Ethernet over EtherCAT).
For information about how to set up your EDGE Connect CNC to send EoE command messages to
external devices with TCP (Transmission Control Protocol) and UDP (User Datagram Protocol),
refer to the EoE Command Messaging Application Note (810940) at Hypertherm.com/docs
## .

EDGE ConnectProgrammer Reference80955090
Import DXF Files
Phoenix uses ProNest CNC to import DXF and other CAD files. To open ProNest CNC, choose
Main screen > Shape Manager > ProNest CNC. ProNest CNC can import the following CAD file
formats:
## .DXF
## .DWG
## .DGN
## .CAM
CAD files must follow these rules:
1.Only include cut geometry.
When a CAD file is added in ProNest CNC, all geometry found in the file is cut. Even if there is
a designated layer for marking, the geometry on that layer will still be cut. For this reason, make
sure that your drawing has been cleaned and only cut geometry is included in the CAD file.
2.Multi-part CAD files are not supported.
If a CAD file contains multiple separate parts, that file can’t be imported into ProNest CNC.
Only single-part CAD files are supported. Note that CAD files that contain entire nests of parts
can’t be added in ProNest CNC.
3.Be sure file units of the CAD file match the units used in Phoenix.
ProNest CNC assumes that your CAD files are drawn with the same units as the CNC. Phoenix
can be set to English or Metric Units. When in English Units, CAD files should be drawn in
inches. When in Metric Units, CAD files should be drawn in millimeters.
If units are different, your parts will be too big or too small. For instance, if ProNest CNC is set to
use English Units and you import a part that was drawn in millimeters, the part will be severely
oversized.

Import DXF Files
## 10
EDGE ConnectProgrammer Reference80955091
For more information about ProNest CNC, see the ProNest CNC Application Note (809560)
available at Hypertherm.com/docs
## .

EDGE ConnectProgrammer Reference80955092
Appendix: Mapped EIA Codes
Phoenix supports part programs that contain mapped EIA codes. However, all of the EIA codes in
the program must be mapped. Phoenix supports code-mapping of the entire part program, but not a
part program that has a mix of mapped and un-mapped codes.
When Phoenix maps the codes, it changes the codes in the part program into directly supported
Phoenix EIA codes when the program is loaded. If you view a mapped part program in the Text
Editor, you will see the mapped codes substituted for the original codes.
The following list defines the EIA codes that are directly mapped by the CNC.
EIA codeDescriptionMapped to
G04 FxProgram dwellG04 x
G05Set axis presetsG92
G21Linear interpolationG01 (at cut speed)
G22CW circular interpolationG02
G23CCW circular interpolationG03
G41 KxLeft kerf with valueG41 with kerf value
G42 KxRight kerf with valueG42 with kerf Value
G97 TxSubroutine loopG08 Xvalue and M40
G45Lead in to kerfed partG01, G02, or G03
G70Select English unitsG20
G71Select metric unitsG21
G98End of subroutine loopM41

Appendix: Mapped EIA Codes
## 11
EDGE ConnectProgrammer Reference80955093
M03Cutting device On/OffM07 (Oxyfuel) or M08 as appropriate
M04Cutting device OnM07
M05Cutting device OffM08 (Oxyfuel)
M06Cutting device OffM08
M06Enable marker 2M13
M07Disable marker 1 or 2M10 or M14 as appropriate
M08Enable marker 1M09
M09Disable marker 1 or 2M10 or M14 as appropriate
M10Enable marker 2M13
M14Height sensor DisableM50
M15Height sensor enableM51
M20Cutting device On/OffM07 or M08 as appropriate (Plasma)
M21Cutting device On/OffM07 or M08 as appropriate (Plasma)
M20Output 9 OnO9 S1
M21Output 9 OffO9 S0
M22Output 12 OnO12 S1
M23Output 12 OffO12 S0
M24Wait for input 7 OnW7 S1
M25Wait for input 8 onW8 S1
M25CBH enableM29
M26Wait for input 7 OffW7 S0
M26CBH disableM28
M27Wait for input 8 OffW8 S0
M67, M02Kerf leftG41
M68, M03Kerf rightG42
M69, M04Kerf OffG40
M65, M70Cutting Device OnM07
M66, M71, M73Cutting Device OffM08
M70Marker Offset 1 OffM12
M71Marker Offset 1 OnM11
M70T01Marker Offset 1 OffM12
M71T01Marker Offset 1 OnM11
EIA codeDescriptionMapped to

Appendix: Mapped EIA Codes
## 11
94809550Programmer ReferenceEDGE Connect
M70T02Marker Offset 2 OffM72
M71T02Marker Offset 2 OnM73
M70T03Marker Offset 3 OffM274
M71T03Marker Offset 3 OnM275
M70T04Marker Offset 4 OffM276
M71T04Marker Offset 4 OnM277
M70T05Marker Offset 5 OffM278
M71T05Marker Offset 5 OnM279
M70T06Marker Offset 6 OffM280
M71T06Marker Offset 6 OnM281
M70T07Marker Offset 7 OffM282
M71T07Marker Offset 7 OnM283
M70T08Marker Offset 8 OffM284
M71T08Marker Offset 8 OnM285
M98End comment)
M99Start Comment(
M221No Mirror, No RotateG99 X1 Y0 I0 J0
M222Mirror Y, No RotateG99 X1 Y0 I0 J1
M223Mirror X and YG99 X1 Y0 I1 J1
M224Mirror X, No RotateG99 X1 Y0 I1 J0
M225Mirror X/Y on -45 DegG99 X1 Y270 I1 J0
M226Rotate 90 Deg CCWG99 X1 Y90 I0 J0
M227Mirror X/Y on +45 DegG99 X1 Y270 I0 J1
M228Rotate 90 Deg CWG99 X1 Y270 I0 J0
M245Output 1 OnO1 S1
M246Output 1 OffO1 S0
M247Output 2 OnO2 S1
M248Output 2 OffO2 S0
M249Output 3 OnO3 S1
M250Output 3 OffO3 S0
M251Output 4 OnO4 S1
M252Output 4 OffO4 S0
EIA codeDescriptionMapped to

Appendix: Mapped EIA Codes
## 11
EDGE ConnectProgrammer Reference80955095
M253Wait for Input 1 OnW1 S1
M254Wait for Input 1 OffW1 S0
M255Wait for Input 2 OnW2 S1
M256Wait for Input 2 OffW2 S0
M257Wait for Input 3 OnW3 S1
M258Wait for Input 3 OffW3 S0
M259Wait for Input 4 OnW4 S1
M260Wait for Input 4 OffW4 S0
EIA codeDescriptionMapped to