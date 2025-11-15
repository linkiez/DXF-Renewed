AutoCAD 2012

# DXF Reference

XepoTnV

© 2011 Autodesk, Inc. All Rights Reserved. Except as otherwise permitted by Autodesk, Inc., this publication, or parts thereof, may not be reproduced in any form, by any method, for any purpose.

Certain materials included in this publication are reprinted with the permission of the copyright holder.

# Trademarks

The following are registered trademarks or trademarks of Autodesk, Inc., and/or its subsidiaries and/or affiliates in the USA and other countries: 3DEC (design/logo), 3December, 3December.com, 3ds Max, Algor, Alias, Alias (swirl design/logo), AliasStudio, AliasWavefront (design/logo), ATC, AUGI, AutoCAD, AutoCAD Learning Assistance, AutoCAD LT, AutoCAD Simulator, AutoCAD SQL Extension, AutoCAD SQL Interface, Autodesk, Autodesk Intent, Autodesk Inventor, Autodesk MapGuide, Autodesk Streamline, AutoLISP, AutoSnap, AutoSketch, AutoTrack, Backburner, Backdraft, Beast, Built with ObjectARX (logo), Burn, Buzzsaw, CAiCE, Civil 3D, Cleaner, Cleaner Central, ClearScale, Colour Warper, Combustion, Communication Specification, Constructware, Content Explorer, Dancing Baby (image), DesignCenter, Design Doctor, Designer's Toolkit, DesignKids, DesignProf, DesignServer, DesignStudio, Design Web Format, Discreet, DWF, DWG, DWG (logo), DWG Extreme, DWG TrueConvert, DWG TrueView, DXF, Ecotect, Exposure, Extending the Design Team, Face Robot, FBX, Fempro, Fire, Flame, Flare, Flint, FMDisplay, Freewheel, GDX Driver, Green Building Studio, Heads-up Design, Heidi, HumanIK, IDEA Server, i-drop, Illuminate Labs AB (design/logo), ImageModeler, iMOUT, Incinerator, Inferno, Inventor, Inventor LT, Kynapse, Kynogon, LandXplorer, LiquidLight, LiquidLight (design/logo), Lustre, MatchMover, Maya, Mechanical Desktop, Moldflow, Moldflow Plastics Advisers, MPI, Moldflow Plastics Insight, Moldflow Plastics Xpert, Moondust, MotionBuilder, Movimento, MPA, MPA (design/logo), MPX, MPX (design/logo), Mudbox, Multi-Master Editing, Navisworks, ObjectARX, ObjectDBX, Opticore, Pipeplus, PolarSnap, PortfolioWall. Powered with Autodesk Technology. Productstream. ProMaterials. RasterDWG. RealDWG. Real-time Roto. Recognize. Render Queue. Retimer. Reveal. Revit. RiverCAD. Robot. Showcase. Show Me. ShowMotion. SketchBook. Smoke. Softimage. SoftimagelXSI (design/logo). Sparks. SteeringWheels. Stitcher. Stone. StormNET. StudioTools. ToolClip. Topobase. Toxik. TrustedDWG. U-Vis. ViewCube. Visual. Visual LISP. Volo. Vtour. WaterNetworks. Wire. Wiretap. WiretapCentral. XSI.

All other brand names, product names or trademarks belong to their respective holders.

# Disclaimer

THIS PUBLICATION AND THE INFORMATION CONTAINED HEREIN IS MADE AVAILABLE BY AUTODESK, INC. "AS IS." AUTODESK, INC. DISCLAIMS ALL WARRANTYES, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE REGARDING THESE MATERIALS.

Published by:

Autodesk, Inc.

111 McInnis Parkway

San Rafael, CA 94903, USA

# Contents

# Chapter 1 DXF Format. 1

Organization of This Reference 1
Revisions to the DXF Reference 1
Formating Conventions in This Reference 2
Object and Entity Codes 2
Group Code Value Types 3
Group Codes in Numerical Order 5

# Chapter 2 HEADER Section. 11

HEADER Section Group Codes 11
Revised VPORT Header Variables 28
Special Handling of Date/Time Variables 29

# Chapter 3 CLASSES Section 31

CLASSES Section Group Codes 31
Default Class Values 32

# Chapter 4 TABLES Section. 35

Symbol Table Group Codes 35
Common Symbol Table Group Codes 36
Common Group Codes for Symbol Table Entries 37
APPID 38

BLOCK_RECORD 38
DIMSTYLE 39
LAYER 43
LTYPE 44
STYLE 46
UCS 47
VIEW 49
VPORT 52

# Chapter 5 BLOCKS Section. 57

BLOCKS Section Group Codes 57
BLOCK 58
ENDBLK 59

# Chapter 6 ENTITIES Section 61

Common Group Codes for Entities 61
3DFACE 64
3DSOLID. 65
ACAD proxiesLY. 65
ARC 66
ATTDEF 67
ATTRIB 72
BODY 77
CIRCLE 77
DIMENSION 78

Common Dimension Group Codes 78
Aligned Dimension Group Codes 80
Linear and Rotated Dimension Group Codes 81
Radial and Diameter Dimension Group Codes 82
Angular Dimension Group Codes 83
Ordinate Dimension Group Codes 85
Dimension Style Overrides 86

ELLIPSE 86
HATCH 87

Boundary Path Data 90
Pattern Data 94

HELIX 94
IMAGE 95
INSERT 97
LEADER 98
LIGHT 100
LINE 101
LWPOLYLINE 102
MESH 103
MLINE 104

MLEADERSTYLE 107

MLEADER 109

Common MLeader Group Codes 110

MLEader Context Data Group Codes 112

MLeader Leader Node Group Codes 116

MLEader Leader Line Group Codes 117

MTEXT 117

OLEFRAME 120

OLE2FRAME 120

POINT 123

POLYLINE 123

Polyface Meshes 125

RAY. 126

REGION 126

SECTION 127

SEQEND 128

SHAPE 128

SOLID 129

SPLINE 130

SUN 132

SURFACE 133

Extruded Surface 133

Lofted Surface 135

Revolved Surface 136

Swept Surface 137

TABLE 138

TEXT 144

TOLERANCE 146

TRACE 146

UNDERLAY 147

VERTEX 149

VIEWPORT 150

WIPEOUT 155

XLINE 157

Chapter 7 OBJECTS Section 159

OBJECT Section Group Codes 159

Object Ownership 159

Common Group Codes for Objects 160

ACAD_PROXY_OBJECT 161

ACDBDICKIYARYWDFLT 161

ACDBPLACEHOLDER 162

DATATABLE 163

DICTIONARY 164

DICTIONARYVAR 166

DIMASSOC 166

FIELD 168

GEODATA 170

GROUP 172

IDBUFFER 173

IMAGEDEF 173

IMAGEDEF_REACTOR 174

LAYER_INDEX 175

LAYER_FILTER 175

LAYOUT 176

LIGHTLIST 179

MATERIAL 179

MLINESTYLE 186

OBJECT_PTR 188

PLOT SETTINGS 189

RASTERVARIABLES 192

RENDER 193

RENDERENVIRONMENT 193

MENTALRAYRENDERSETTINGS 194

RENDERGLOBAL 197

SECTION 198

Section Manager 199

Section Settings 199

Section Type Settings 200

Section Geometry Settings 201

SPATIAL_INDEX 202

SPATIAL_FILTER 203

SORTENTSTABLE 204

TABLESTYLE 205

UNDERLAYDEFINITION 207

VISUALSTYLE 208

VBA PROJECT 211

WIPEOUTVARIABLES 211

XRECORD 212

Chapter 8 THUMBMAILIMAGE Section 215

THUMBMAILIMAGE Section Group Codes 215

Chapter 9 Drawing Interchange File Formats 217

ASCII DXF Files 217

General DXF File Structure 217

Group Codes in DXF Files 219

ASCII Control Characters in DXF Files 219

Header Group Codes in DXF Files 219

Class Group Codes in DXF Files 220

Symbol Table Group Codes in DXF Files 220

Symbol Table Example 221

Blocks Group Codes in DXF Files 224
Entity Group Codes in DXF Files 226
Object Group Codes in DXF Files 226
Writing a DXF Interface Program 227
Reading a DXF File 228
Writing a DXF File 230

Binary DXF Files 234

Slide Files 235

Old Slide Header 238

Slide Library Files 239

Chapter 10 Advanced DXF Issues 241

Database Objects 241
Persistent Inter-Object Reference Handles 241
Pointer and Ownership References 242
Hard and Soft References 242
Arbitrary Handles 243
1005 Group Codes 243
Subclass Markers 243
Extension Dictionary and Persistent Reactors 246
Extended Data 246
Object Coordinate Systems (OCS) 250
Arbitrary Axis Algorithm 252

Index 253

# DXF Format

# 1

The  $\mathrm{DXF}^{\mathrm{TM}}$  format is a tagged data representation of all the information contained in an AutoCAD $^{\text{®}}$  drawing file. Tagged data means that each data element in the file is preceded by an integer number that is called a group code. A group code's value indicates what type of data element follows. This value also indicates the meaning of a data element for a given object (or record) type. Virtually all user-specified information in a drawing file can be represented in DXF format.

# Organization of This Reference

The DXF Reference presents the  $\mathrm{DXF}^{\mathrm{TM}}$  group codes found in DXF files and encountered by AutoLISP® and ObjectARX® applications. This chapter describes the general DXF conventions. The remaining chapters list the group codes organized by object type. The group codes are presented in the order in which they are found in a DXF file, and each chapter is named according to the associated section of a DXF file. Although the DXF file format is used as the organizing mechanism for this reference, specific information on the actual formatting of DXF files is found in Drawing Interchange File Formats on page 217 Advanced concepts relating to DXF group codes as they pertain to both applications and DXF files are found in Advanced DXF Issues on page 241

For descriptions of the AutoLISP functions that use group codes, see "Using AutoLISP to Manipulate AutoCAD Objects" in the AutoLISP Developer's Guide.

# Revisions to the DXF Reference

This topic lists revisions since the last update of the DXF Reference. The version number of this DXF Reference is u19.1.01.

ENTITIES Section

# Formatting Conventions in This Reference

Each group code listed in this reference is presented by a numeric group code value and a description. All group codes can apply to  $\mathrm{DXF}^{\mathrm{TM}}$  files, applications (AutoLISP or ObjectARX), or both. When the description of a code is different for applications and DXF files (or applies to only one or the other), the description is preceded by the following indicators:

APP.Application-specific description.
DXF.DXF file-specific description.

If the description is common to both DXF files and applications, no indicator is provided.

Optional codes are indicated as "optional" in the description.

# Object and Entity Codes

In the  $\mathrm{DXF}^{\mathrm{TM}}$  format, the definition of objects differs from entities: objects have no graphical representation and entities do. For example, dictionaries are objects, and not entities. Entities are also referred to as graphical objects while objects are referred to as nongraphical objects.

Entities appear in both the BLOCK and ENTITIES sections of the DXF file. The use of group codes in the two sections is identical.

Some group codes that define an entity always appear; others are optional and appear only if their values differ from the defaults.

Do not write programs that rely on the order given here. The end of an entity is indicated by the next 0 group, which begins the next entity or indicates the end of the section.

NOTE Accommodating DXF files from future releases of AutoCAD® will be easier if you write your DXF processing program in a table-driven way, ignore undefined group codes, and make no assumptions about the order of group codes in an entity. With each new AutoCAD release, new group codes will be added to entities to accommodate additional features.

# Group Code Value Types

Group codes define the type of the associated value as an integer, a floating-point number, or a string, according to the following table of group code ranges. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Group code value types</td></tr>
    <tr>
        <td>Code range</td>
        <td>Group value type</td>
    </tr>
    <tr>
        <td>0-9</td>
        <td>
            String (with the introduction of extended symbol names in AutoCAD 2000, the 255-character limit has been
            increased to 2049 single-byte characters not including the newline at the end of the line)
        </td>
    </tr>
    <tr>
        <td>10-39</td>
        <td>Double precision 3D point value</td>
    </tr>
    <tr>
        <td>40-59</td>
        <td>Double-precision floating-point value</td>
    </tr>
    <tr>
        <td>60-79</td>
        <td>16-bit integer value</td>
    </tr>
    <tr>
        <td>90-99</td>
        <td>32-bit integer value</td>
    </tr>
    <tr>
        <td>100</td>
        <td>String (255-character maximum; less for Unicode strings)</td>
    </tr>
    <tr>
        <td>102</td>
        <td>String (255-character maximum; less for Unicode strings)</td>
    </tr>
    <tr>
        <td>105</td>
        <td>String representing hexadecimal (hex) handle value</td>
    </tr>
    <tr>
        <td>110-119</td>
        <td>Double precision floating-point value</td>
    </tr>
    <tr>
        <td>120-129</td>
        <td>Double precision floating-point value</td>
    </tr>
    <tr>
        <td>130-139</td>
        <td>Double precision floating-point value</td>
    </tr>
    <tr>
        <td>140-149</td>
        <td>Double precision scalar floating-point value</td>
    </tr>
    <tr>
        <td>160-169</td>
        <td>64-bit integer value</td>
    </tr>
    <tr>
        <td>170-179</td>
        <td>16-bit integer value</td>
    </tr>
    <tr>
        <td>210-239</td>
        <td>Double-precision floating-point value</td>
    </tr>
    <tr>
        <td>270-279</td>
        <td>16-bit integer value</td>
    </tr>
    <tr>
        <td>280-289</td>
        <td>16-bit integer value</td>
    </tr>
    <tr>
        <td>290-299</td>
        <td>Boolean flag value</td>
    </tr>
    <tr>
        <td>300-309</td>
        <td>Arbitrary text string</td>
    </tr>
    <tr>
        <td>310-319</td>
        <td>String representing hex value of binary chunk</td>
    </tr>
    <tr>
        <td>320-329</td>
        <td>String representing hex handle value</td>
    </tr>
    <tr>
        <td>330-369</td>
        <td>String representing hex object IDs</td>
    </tr>
    <tr>
        <td>370-379</td>
        <td>16-bit integer value</td>
    </tr>
    <tr>
        <td>380-389</td>
        <td>16-bit integer value</td>
    </tr>
    <tr>
        <td>390-399</td>
        <td>String representing hex handle value</td>
    </tr>
    <tr>
        <td>400-409</td>
        <td>16-bit integer value</td>
    </tr>
    <tr>
        <td>410-419</td>
        <td>String</td>
    </tr>
    <tr>
        <td>420-429</td>
        <td>32-bit integer value</td>
    </tr>
    <tr>
        <td>430-439</td>
        <td>String</td>
    </tr>
    <tr>
        <td>440-449</td>
        <td>32-bit integer value</td>
    </tr>
    <tr>
        <td>450-459</td>
        <td>Long</td>
    </tr>
    <tr>
        <td>460-469</td>
        <td>Double-precision floating-point value</td>
    </tr>
    <tr>
        <td>470-479</td>
        <td>String</td>
    </tr>
    <tr>
        <td>480-481</td>
        <td>String representing hex handle value</td>
    </tr>
    <tr>
        <td>999</td>
        <td>Comment (string)</td>
    </tr>
    <tr>
        <td>1000-1009</td>
        <td>String (same limits as indicated with 0-9 code range)</td>
    </tr>
    <tr>
        <td>1010-1059</td>
        <td>Double-precision floating-point value</td>
    </tr>
    <tr>
        <td>1060-1070</td>
        <td>16-bit integer value</td>
    </tr>
    <tr>
        <td>1071</td>
        <td>32-bit integer value</td>
    </tr>
</table>
```

# Group Codes in Numerical Order

The following table gives the group code or group code range accompanied by an explanation of the group code value. In the table, "fixed" indicates that the group code always has the same purpose. If a group code isn't fixed, its purpose depends on the context. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Group codes by number</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>-5</td>
        <td>APP: persistent reactor chain</td>
    </tr>
    <tr>
        <td>-4</td>
        <td>APP: conditional operator (used only with ssget)</td>
    </tr>
    <tr>
        <td>-3</td>
        <td>APP: extended data (XDATA) sentinel (fixed)</td>
    </tr>
    <tr>
        <td>-2</td>
        <td>APP: entity name reference (fixed)</td>
    </tr>
    <tr>
        <td>-1</td>
        <td>APP: entity name. The name changes each time a drawing is opened. It is never saved (fixed)</td>
    </tr>
    <tr>
        <td>0</td>
        <td>Text string indicating the entity type (fixed)</td>
    </tr>
    <tr>
        <td>1</td>
        <td>Primary text value for an entity</td>
    </tr>
    <tr>
        <td>2</td>
        <td>Name (attribute tag, block name, and so on)</td>
    </tr>
    <tr>
        <td>3-4</td>
        <td>Other text or name values</td>
    </tr>
    <tr>
        <td>5</td>
        <td>Entity handle; text string of up to 16 hexadecimal digits (fixed)</td>
    </tr>
    <tr>
        <td>6</td>
        <td>Linetype name (fixed)</td>
    </tr>
    <tr>
        <td>7</td>
        <td>Text style name (fixed)</td>
    </tr>
    <tr>
        <td>8</td>
        <td>Layer name (fixed)</td>
    </tr>
    <tr>
        <td>9</td>
        <td>DXF: variable name identifier (used only in HEADER section of the DXF file)</td>
    </tr>
    <tr>
        <td>10</td>
        <td>
            Primary point; this is the start point of a line or text entity, center of a circle, and so on DXF: X value
            of the primary point (followed by Y and Z value codes 20 and 30)APP: 3D point (list of three reals)
        </td>
    </tr>
    <tr>
        <td>11-18</td>
        <td>
            Other pointsDXF: X value of other points (followed by Y value codes 21-28 and Z value codes 31-38)APP: 3D
            point (list of three reals)
        </td>
    </tr>
    <tr>
        <td>20, 30</td>
        <td>DXF: Y and Z values of the primary point</td>
    </tr>
    <tr>
        <td>21-28, 31-37</td>
        <td>DXF: Y and Z values of other points</td>
    </tr>
    <tr>
        <td>38</td>
        <td>DXF: entity's elevation if nonzero</td>
    </tr>
    <tr>
        <td>39</td>
        <td>Entity's thickness if nonzero (fixed)</td>
    </tr>
    <tr>
        <td>40-48</td>
        <td>Double-precision floating-point values (text height, scale factors, and so on)</td>
    </tr>
    <tr>
        <td>48</td>
        <td>
            Linetype scale; double precision floating point scalar value; default value is defined for all entity types
        </td>
    </tr>
    <tr>
        <td>49</td>
        <td>
            Repeated double-precision floating-point value. Multiple 49 groups may appear in one entity for
            variable-length tables (such as the dash lengths in the LTYPE table). A 7x group always appears before the
            first 49 group to specify the table length
        </td>
    </tr>
    <tr>
        <td>50-58</td>
        <td>Angles (output in degrees to DXF files and radians through AutoLISP and ObjectARX applications)</td>
    </tr>
    <tr>
        <td>60</td>
        <td>Entity visibility; integer value; absence or 0 indicates visibility; 1 indicates invisibility</td>
    </tr>
    <tr>
        <td>62</td>
        <td>Color number (fixed)</td>
    </tr>
    <tr>
        <td>66</td>
        <td>"Entities follow" flag (fixed)</td>
    </tr>
    <tr>
        <td>67</td>
        <td>Space—that is, model or paper space (fixed)</td>
    </tr>
    <tr>
        <td>68</td>
        <td>APP: identifies whether viewport is on but fully off screen; is not active or is off</td>
    </tr>
    <tr>
        <td>69</td>
        <td>APP:viewport identification number</td>
    </tr>
    <tr>
        <td>70-78</td>
        <td>Integer values, such as repeat counts, flag bits, or modes</td>
    </tr>
    <tr>
        <td>90-99</td>
        <td>32-bit integer values</td>
    </tr>
    <tr>
        <td>100</td>
        <td>
            Subclass data marker (with derived class name as a string). Required for all objects and entity classes that
            are derived from another concrete class. The subclass data marker segregates data defined by different
            classes in the inheritance chain for the same object. This is in addition to the requirement for DXF names
            for each distinct concrete class derived from ObjectARX (see Subclass Markers on page 243)
        </td>
    </tr>
    <tr>
        <td>102</td>
        <td>
            Control string, followed by “{arbitrary name}" or "}". Similar to the xdata 1002 group code, except that
            when the string begins with “{”, it can be followed by an arbitrary string whose interpretation is up to the
            application. The only other control string allowed is “}” as a group terminator. AutoCAD does not interpret
            these strings except during drawing audit operations. They are for application use
        </td>
    </tr>
    <tr>
        <td>105</td>
        <td>Object handle for DIMVAR symbol table entry</td>
    </tr>
    <tr>
        <td>110</td>
        <td>UCS origin (appears only if code 72 is set to 1) DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>111</td>
        <td>UCS X-axis (appears only if code 72 is set to 1) DXF: X value; APP: 3D vector</td>
    </tr>
    <tr>
        <td>112</td>
        <td>UCS Y-axis (appears only if code 72 is set to 1) DXF: X value; APP: 3D vector</td>
    </tr>
    <tr>
        <td>120-122</td>
        <td>DXF: Y value of UCS origin, UCS X-axis, and UCS Y-axis</td>
    </tr>
    <tr>
        <td>130-132</td>
        <td>DXF: Z value of UCS origin, UCS X-axis, and UCS Y-axis</td>
    </tr>
    <tr>
        <td>140-149</td>
        <td>Double-precision floating-point values (points, elevation, and DIMSTYLE settings, for example)</td>
    </tr>
    <tr>
        <td>170-179</td>
        <td>16-bit integer values, such as flag bits representing DIMSTYLE settings</td>
    </tr>
    <tr>
        <td>210</td>
        <td>Extrusion direction (fixed)</td>
    </tr>
    <tr>
        <td></td>
        <td>DXF: X value of extrusion direction APP: 3D extrusion direction vector</td>
    </tr>
    <tr>
        <td>220, 230</td>
        <td>DXF: Y and Z values of the extrusion direction</td>
    </tr>
    <tr>
        <td>270-279</td>
        <td>16-bit integer values</td>
    </tr>
    <tr>
        <td>280-289</td>
        <td>16-bit integer value</td>
    </tr>
    <tr>
        <td>290-299</td>
        <td>Boolean flag value</td>
    </tr>
    <tr>
        <td>300-309</td>
        <td>Arbitrary text strings</td>
    </tr>
    <tr>
        <td>310-319</td>
        <td>
            Arbitrary binary chunks with same representation and limits as 1004 group codes: hexadecimal strings of up
            to 254 characters represent data chunks of up to 127 bytes
        </td>
    </tr>
    <tr>
        <td>320-329</td>
        <td>
            Arbitrary object handles; handle values that are taken “as is”. They are not translated during INSERT and
            XREF operations
        </td>
    </tr>
    <tr>
        <td>330-339</td>
        <td>
            Soft-pointer handle; arbitrary soft pointers to other objects within same DXF file or drawing. Translated
            during INSERT and XREF operations
        </td>
    </tr>
    <tr>
        <td>340-349</td>
        <td>
            Hard-pointer handle; arbitrary hard pointers to other objects within same DXF file or drawing. Translated
            during INSERT and XREF operations
        </td>
    </tr>
    <tr>
        <td>350-359</td>
        <td>
            Soft-owner handle; arbitrary soft ownership links to other objects within same DXF file or drawing.
            Translated during INSERT and XREF operations
        </td>
    </tr>
    <tr>
        <td>360-369</td>
        <td>
            Hard-owner handle; arbitrary hard ownership links to other objects within same DXF file or drawing.
            Translated during INSERT and XREF operations
        </td>
    </tr>
    <tr>
        <td>370-379</td>
        <td>
            Lineweight enum value (AcDb::LineWeight). Stored and moved around as a 16-bit integer. Custom non-entity
            objects may use the full range, but entity classes only use 371-379 DXF group codes in their representation,
            because AutoCAD and AutoLISP both always assume a 370 group code is the entity's lineweight. This allows 370
            to behave like other “common” entity fields
        </td>
    </tr>
    <tr>
        <td>380-389</td>
        <td>
            PlotStyleName type enum (AcDb::PlotStyleTypeName). Stored and moved around as a 16-bit integer. Custom
            non-entity objects may use the full range, but entity classes only use 381-389 DXF group codes in their
            representation, for the same reason as the Lineweight range above
        </td>
    </tr>
    <tr>
        <td>390-399</td>
        <td>
            String representing handle value of the PlotStyleName object, basically a hard pointer, but has a different
            range to make backward compatibility easier to deal with. Stored and moved around as an object ID (a handle
            in DXF files) and a special type in AutoLISP. Custom non-entity objects may use the full range, but entity
            classes only use 391-399 DXF group codes in their representation, for the same reason as the linewidth range
            above
        </td>
    </tr>
    <tr>
        <td>400-409</td>
        <td>16-bit integers</td>
    </tr>
    <tr>
        <td>410-419</td>
        <td>String</td>
    </tr>
    <tr>
        <td>420-427</td>
        <td>
            32-bit integer value. When used with True Color; a 32-bit integer representing a 24-bit color value. The
            high-order byte (8 bits) is 0, the low-order byte an unsigned char holding the Blue value (0-255), then the
            Green value, and the next-to-high order byte is the Red Value. Converting this integer value to hexadecimal
            yields the following bit mask: 0x00RRGGBB. For example, a true color with Red==200, Green==100 and Blue==50
            is 0x00C86432, and in DXF, in decimal, 13132850
        </td>
    </tr>
    <tr>
        <td>430-437</td>
        <td>String; when used for True Color, a string representing the name of the color</td>
    </tr>
    <tr>
        <td>440-447</td>
        <td>32-bit integer value. When used for True Color, the transparency value</td>
    </tr>
    <tr>
        <td>450-459</td>
        <td>Long</td>
    </tr>
    <tr>
        <td>460-469</td>
        <td>Double-precision floating-point value</td>
    </tr>
    <tr>
        <td>470-479</td>
        <td>String</td>
    </tr>
    <tr>
        <td>480-481</td>
        <td>
            Hard-pointer handle; arbitrary hard pointers to other objects within same DXF file or drawing. Translated
            during INSERT and XREF operations
        </td>
    </tr>
    <tr>
        <td>999</td>
        <td>
            DXF: The 999 group code indicates that the line following it is a comment string. SAVEAS does not include
            such groups in a DXF output file, but OPEN honors them and ignores the comments. You can use the 999 group
            to include comments in a DXF file that you've edited
        </td>
    </tr>
    <tr>
        <td>1000</td>
        <td>ASCII string (up to 255 bytes long) in extended data</td>
    </tr>
    <tr>
        <td>1001</td>
        <td>Registered application name (ASCII string up to 31 bytes long) for extended data</td>
    </tr>
    <tr>
        <td>1002</td>
        <td>Extended data control string ("{} or ")")</td>
    </tr>
    <tr>
        <td>1003</td>
        <td>Extended data layer name</td>
    </tr>
    <tr>
        <td>1004</td>
        <td>Chunk of bytes (up to 127 bytes long) in extended data</td>
    </tr>
    <tr>
        <td>1005</td>
        <td>Entity handle in extended data; text string of up to 16 hexadecimal digits</td>
    </tr>
    <tr>
        <td>1010</td>
        <td>A point in extended data DXF: X value (followed by 1020 and 1030 groups) APP: 3D point</td>
    </tr>
    <tr>
        <td>1020, 1030</td>
        <td>DXF: Y and Z values of a point</td>
    </tr>
    <tr>
        <td>1011</td>
        <td>
            A 3D world space position in extended data DXF: X value (followed by 1021 and 1031 groups) APP: 3D point
        </td>
    </tr>
    <tr>
        <td>1021, 1031</td>
        <td>DXF: Y and Z values of a world space position</td>
    </tr>
    <tr>
        <td>1012</td>
        <td>
            A 3D world space displacement in extended data DXF: X value (followed by 1022 and 1032 groups) APP: 3D
            vector
        </td>
    </tr>
    <tr>
        <td>1022, 1032</td>
        <td>DXF: Y and Z values of a world space displacement</td>
    </tr>
    <tr>
        <td>1013</td>
        <td>
            A 3D world space direction in extended data DXF: X value (followed by 1022 and 1032 groups) APP: 3D vector
        </td>
    </tr>
    <tr>
        <td>1023, 1033</td>
        <td>DXF: Y and Z values of a world space direction</td>
    </tr>
    <tr>
        <td>1040</td>
        <td>Extended data double-precision floating-point value</td>
    </tr>
    <tr>
        <td>1041</td>
        <td>Extended data distance value</td>
    </tr>
    <tr>
        <td>1042</td>
        <td>Extended data scale factor</td>
    </tr>
    <tr>
        <td>1070</td>
        <td>Extended data 16-bit signed integer</td>
    </tr>
    <tr>
        <td>1071</td>
        <td>Extended data 32-bit signed long</td>
    </tr>
</table>
```html

# HEADER Section

# 2

The group codes described in this chapter pertain only to  $\mathrm{DXF}^{\mathrm{TM}}$  files. The HEADER section of a DXF file contains the settings of variables associated with the drawing. Each variable is specified by a 9 group code giving the variable's name, followed by groups that supply the variable's value. This chapter lists only the variables that are saved in the drawing file.

# HEADER Section Group Codes

The following table lists the variables that are represented in the HEADER section of a  $\mathrm{DXF}^{\mathrm{TM}}$  file. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="3">DXF header variables</td></tr><tr><td>Variable</td><td>Group code</td><td>Description</td></tr><tr><td>$ACADMAINTVER</td><td>70</td><td>Maintenance version number (should be ignored)</td></tr><tr><td>$ACADVER</td><td>1</td><td>The AutoCAD drawing database version number:
AC1006 = R10;
AC1009 = R11 and R12;
AC1012 = R13; AC1014 = R14;
AC1015 = AutoCAD 2000;
AC1018 = AutoCAD 2004;
AC1021 = AutoCAD 2007;
AC1024 = AutoCAD 2010</td></tr><tr><td>$ANGBASE</td><td>50</td><td>Angle 0 direction</td></tr><tr><td>$ANGDIR</td><td>70</td><td>1 = Clockwise angles
0 = Counterclockwise angles</td></tr></table>

DXF header variables

<table><tr><td>Variable</td><td>Group code</td><td>Description</td></tr><tr><td>$ATTMODE</td><td>70</td><td>Attribute visibility:
0 = None
1 = Normal
2 = All</td></tr><tr><td>$AUNITS</td><td>70</td><td>Units format for angles</td></tr><tr><td>$AUPREC</td><td>70</td><td>Units precision for angles</td></tr><tr><td>$CECOLOR</td><td>62</td><td>Current entity color number:
0 = BYBLOCK; 256 = BYLAYER</td></tr><tr><td>$CELTSCALE</td><td>40</td><td>Current entity linetype scale</td></tr><tr><td>$CELTYPE</td><td>6</td><td>Entity linetype name, or BYBLOCK or BYLAYER</td></tr><tr><td>$CELWEIGHT</td><td>370</td><td>Lineweight of new objects</td></tr><tr><td>$CEPSNID</td><td>390</td><td>Plotstyle handle of new objects; if CEPSNTYPE is 3, then this value indicates the handle</td></tr><tr><td>$CEPSNTYPE</td><td>380</td><td>Plot style type of new objects:
0 = Plot style by layer
1 = Plot style by block
2 = Plot style by dictionary default
3 = Plot style by object ID/handle</td></tr><tr><td>$CHAMFERA</td><td>40</td><td>First chamfer distance</td></tr><tr><td>$CHAMFERB</td><td>40</td><td>Second chamfer distance</td></tr><tr><td>$CHAMFERC</td><td>40</td><td>Chamfer length</td></tr><tr><td>$CHAMFERD</td><td>40</td><td>Chamfer angle</td></tr><tr><td>$CLAYER</td><td>8</td><td>Current layer name</td></tr><tr><td>$CMLJUST</td><td>70</td><td>Current multiline justification:
0 = Top; 1 = Middle; 2 = Bottom</td></tr></table>

DXF header variables

<table><tr><td>Variable</td><td>Group code</td><td>Description</td></tr><tr><td>$CMLSCALE</td><td>40</td><td>Current multiline scale</td></tr><tr><td>$CMLSTYLE</td><td>2</td><td>Current multiline style name</td></tr><tr><td>$CSHADOW</td><td>280</td><td>Shadow mode for a 3D object:
0 = Casts and receives shadows
1 = Casts shadows
2 = Receives shadows
3 = Ignores shadows</td></tr><tr><td>$DIMADEC</td><td>70</td><td>Number of precision places displayed in angular dimensions</td></tr><tr><td>$DIMALT</td><td>70</td><td>Alternate unit dimensioning performed if nonzero</td></tr><tr><td>$DIMALTD</td><td>70</td><td>Alternate unit decimal places</td></tr><tr><td>$DIMALTF</td><td>40</td><td>Alternate unit scale factor</td></tr><tr><td>$DIMALTRND</td><td>40</td><td>Determines rounding of alternate units</td></tr><tr><td>$DIMALTTD</td><td>70</td><td>Number of decimal places for tolerance values of an alternate units dimension</td></tr><tr><td>$DIMALTTZ</td><td>70</td><td>Controls suppression of zeros for alternate tolerance values:
0 = Suppresses zero feet and precisely zero inches
1 = Includes zero feet and precisely zero inches
2 = Includes zero feet and suppresses zero inches
3 = Includes zero inches and suppresses zero feet</td></tr><tr><td>$DIMALTU</td><td>70</td><td>Units format for alternate units of all dimension style family members except angular:
1 = Scientific; 2 = Decimal; 3 = Engineering;
4 = Architectural (stacked); 5 = Fractional (stacked);
6 = Architectural; 7 = Fractional</td></tr><tr><td>$DIMALTZ</td><td>70</td><td>Controls suppression of zeros for alternate unit dimension values:
0 = Suppresses zero feet and precisely zero inches
1 = Includes zero feet and precisely zero inches
2 = Includes zero feet and suppresses zero inches</td></tr></table>

DXF header variables

<table><tr><td>Variable</td><td>Group code</td><td>Description</td></tr><tr><td></td><td></td><td>3 = Includes zero inches and suppresses zero feet</td></tr><tr><td>$DIMAPOST</td><td>1</td><td>Alternate dimensioning suffix</td></tr><tr><td>$DIMASO</td><td>70</td><td>1 = Create associative dimensioning
0 = Draw individual entities</td></tr><tr><td>$DIMASSOC</td><td>280</td><td>Controls the associativity of dimension objects
0 = Creates exploded dimensions; there is no association between elements of the dimension, and the lines, arcs, arrowheads, and text of a dimension are drawn as separate objects
1 = Creates non-associative dimension objects; the elements of the dimension are formed into a single object, and if the definition point on the object moves, then the dimension value is updated
2 = Creates associative dimension objects; the elements of the dimension are formed into a single object and one or more definition points of the dimension are coupled with association points on geometric objects</td></tr><tr><td>$DIMASZ</td><td>40</td><td>Dimensioning arrow size</td></tr><tr><td>$DIMATFIT</td><td>70</td><td>Controls dimension text and arrow placement when space is not sufficient to place both within the extension lines:
0 = Places both text and arrows outside extension lines
1 = Moves arrows first, then text
2 = Moves text first, then arrows
3 = Moves either text or arrows, whichever fits best
AutoCAD adds a leader to moved dimension text when DIMTMOVE is set to 1</td></tr><tr><td>$DIMAUNIT</td><td>70</td><td>Angle format for angular dimensions:
0 = Decimal degrees; 1 = Degrees/minutes/seconds;
2 = Gradians; 3 = Radians; 4 = Surveyor&#x27;s units</td></tr><tr><td>$DIMAZIN</td><td>70</td><td>Controls suppression of zeros for angular dimensions:
0 = Displays all leading and trailing zeros
1 = Suppresses leading zeros in decimal dimensions
2 = Suppresses trailing zeros in decimal dimensions</td></tr></table>

DXF header variables

<table><tr><td>Variable</td><td>Group code</td><td>Description</td></tr><tr><td></td><td></td><td>3 = Suppresses leading and trailing zeros</td></tr><tr><td>$DIMBLK</td><td>1</td><td>Arrow block name</td></tr><tr><td>$DIMBLK1</td><td>1</td><td>First arrow block name</td></tr><tr><td>$DIMBLK2</td><td>1</td><td>Second arrow block name</td></tr><tr><td>$DIMCEN</td><td>40</td><td>Size of center mark/lines</td></tr><tr><td>$DIMCLRD</td><td>70</td><td>Dimension line color: range is 0 = BYBLOCK; 256 = BYLAYER</td></tr><tr><td>$DIMCLRE</td><td>70</td><td>Dimension extension line color: range is 0 = BYBLOCK; 256 = BYLAYER</td></tr><tr><td>$DIMCLRT</td><td>70</td><td>Dimension text color: range is 0 = BYBLOCK; 256 = BYLAYER</td></tr><tr><td>$DIMDEC</td><td>70</td><td>Number of decimal places for the tolerance values of a primary units dimension</td></tr><tr><td>$DIMDLE</td><td>40</td><td>Dimension line extension</td></tr><tr><td>$DIMDLI</td><td>40</td><td>Dimension line increment</td></tr><tr><td>$DIMDSEP</td><td>70</td><td>Single-character decimal separator used when creating dimensions whose unit format is decimal</td></tr><tr><td>$DIMEXE</td><td>40</td><td>Extension line extension</td></tr><tr><td>$DIMEXO</td><td>40</td><td>Extension line offset</td></tr><tr><td>$DIMFAC</td><td>40</td><td>Scale factor used to calculate the height of text for dimension fractions and tolerances. AutoCAD multiplies DIMTXT by DIMTFAC to set the fractional or tolerance text height</td></tr><tr><td>$DIMGAP</td><td>40</td><td>Dimension line gap</td></tr><tr><td>$DIMJUST</td><td>70</td><td>Horizontal dimension text position:</td></tr></table>

DXF header variables

<table><tr><td>Variable</td><td>Group code</td><td>Description</td></tr><tr><td></td><td></td><td>0 = Above dimension line and center-justified between ext-
tension lines
1 = Above dimension line and next to first extension line
2 = Above dimension line and next to second extension
line
3 = Above and center-justified to first extension line
4 = Above and center-justified to second extension line</td></tr><tr><td>$DIMLDRBLK</td><td>1</td><td>Arrow block name for leaders</td></tr><tr><td>$DIMLFAC</td><td>40</td><td>Linear measurements scale factor</td></tr><tr><td>$DIMLIM</td><td>70</td><td>Dimension limits generated if nonzero</td></tr><tr><td>$DIMLUNIT</td><td>70</td><td>Sets units for all dimension types except Angular:
1 = Scientific; 2 = Decimal; 3 = Engineering;
4 = Architectural; 5 = Fractional; 6 = Windows desktop</td></tr><tr><td>$DIMLWD</td><td>70</td><td>Dimension line lineweight:
-3 = Standard
-2 = ByLayer
-1 = ByBlock
0-211 = an integer representing 100th of mm</td></tr><tr><td>$DIMLWE</td><td>70</td><td>Extension line lineweight:
-3 = Standard
-2 = ByLayer
-1 = ByBlock
0-211 = an integer representing 100th of mm</td></tr><tr><td>$DIMPOST</td><td>1</td><td>General dimensioning suffix</td></tr><tr><td>$DIMRND</td><td>40</td><td>Rounding value for dimension distances</td></tr><tr><td>$DIMSAH</td><td>70</td><td>Use separate arrow blocks if nonzero</td></tr><tr><td>$DIMSCALE</td><td>40</td><td>Overall dimensioning scale factor</td></tr><tr><td>$DIMSD1</td><td>70</td><td>Suppression of first extension line:
0 = Not suppressed; 1 = Suppressed</td></tr><tr><td colspan="3">DXF header variables</td></tr><tr><td>Variable</td><td>Group code</td><td>Description</td></tr><tr><td>$DIMSD2</td><td>70</td><td>Suppression of second extension line:
0 = Not suppressed; 1 = Suppressed</td></tr><tr><td>$DIMSE1</td><td>70</td><td>First extension line suppressed if nonzero</td></tr><tr><td>$DIMSE2</td><td>70</td><td>Second extension line suppressed if nonzero</td></tr><tr><td>$DIMSHO</td><td>70</td><td>1 = Recompute dimensions while dragging
0 = Drag original image</td></tr><tr><td>$DIMSOXD</td><td>70</td><td>Suppress outside-extensions dimension lines if nonzero</td></tr><tr><td>$DIMSTYLE</td><td>2</td><td>Dimension style name</td></tr><tr><td>$DIMTAD</td><td>70</td><td>Text above dimension line if nonzero</td></tr><tr><td>$DIMTDEC</td><td>70</td><td>Number of decimal places to display the tolerance values</td></tr><tr><td>$DIMTFAC</td><td>40</td><td>Dimension tolerance display scale factor</td></tr><tr><td>$DIMTIH</td><td>70</td><td>Text inside horizontal if nonzero</td></tr><tr><td>$DIMTIX</td><td>70</td><td>Force text inside extensions if nonzero</td></tr><tr><td>$DIMTM</td><td>40</td><td>Minus tolerance</td></tr><tr><td>$DIMTMOVE</td><td>70</td><td>Dimension text movement rules:
0 = Moves the dimension line with dimension text
1 = Adds a leader when dimension text is moved
2 = Allows text to be moved freely without a leader</td></tr><tr><td>$DIMTOFL</td><td>70</td><td>If text is outside extensions, force line extensions between extensions if nonzero</td></tr><tr><td>$DIMTOH</td><td>70</td><td>Text outside horizontal if nonzero</td></tr><tr><td>$DIMTOL</td><td>70</td><td>Dimension tolerances generated if nonzero</td></tr><tr><td>$DIMTOLJ</td><td>70</td><td>Vertical justification for tolerance values:
0 = Top; 1 = Middle; 2 = Bottom</td></tr></table>

DXF header variables

<table><tr><td>Variable</td><td>Group code</td><td>Description</td></tr><tr><td>$DIMTP</td><td>40</td><td>Plus tolerance</td></tr><tr><td>$DIMTSZ</td><td>40</td><td>Dimensioning tick size:
0 = No ticks</td></tr><tr><td>$DIMTVP</td><td>40</td><td>Text vertical position</td></tr><tr><td>$DIMTXSTY</td><td>7</td><td>Dimension text style</td></tr><tr><td>$DIMTXT</td><td>40</td><td>Dimensioning text height</td></tr><tr><td>$DIMTZIN</td><td>70</td><td>Controls suppression of zeros for tolerance values:
0 = Suppresses zero feet and precisely zero inches
1 = Includes zero feet and precisely zero inches
2 = Includes zero feet and suppresses zero inches
3 = Includes zero inches and suppresses zero feet</td></tr><tr><td>$DIMUPT</td><td>70</td><td>Cursor functionality for user-positioned text:
0 = Controls only the dimension line location
1 = Controls the text position as well as the dimension line location</td></tr><tr><td>$DIMZIN</td><td>70</td><td>Controls suppression of zeros for primary unit values:
0 = Suppresses zero feet and precisely zero inches
1 = Includes zero feet and precisely zero inches
2 = Includes zero feet and suppresses zero inches
3 = Includes zero inches and suppresses zero feet</td></tr><tr><td>$DISPSILH</td><td>70</td><td>Controls the display of silhouette curves of body objects in Wireframe mode:
0 = Off; 1 = On</td></tr><tr><td>$DRAGVS</td><td>349</td><td>Hard-pointer ID to visual style while creating 3D solid primitives. The default value is NULL</td></tr><tr><td>$DWGCODEPAGE</td><td>3</td><td>Drawing code page; set to the system code page when a new drawing is created, but not otherwise maintained by AutoCAD</td></tr><tr><td>$ELEVATION</td><td>40</td><td>Current elevation set by ELEV command</td></tr></table>

DXF header variables

<table><tr><td>Variable</td><td>Group code</td><td>Description</td></tr><tr><td>$ENDCAPS</td><td>280</td><td>Lineweight endcaps setting for new objects:
0 = none; 1 = round; 2 = angle; 3 = square</td></tr><tr><td>$EXTMAX</td><td>10, 20, 30</td><td>X, Y, and Z drawing extents upper-right corner (in WCS)</td></tr><tr><td>$EXTMIN</td><td>10, 20, 30</td><td>X, Y, and Z drawing extents lower-left corner (in WCS)</td></tr><tr><td>$EXTNAMES</td><td>290</td><td>Controls symbol table naming:
0 = Release 14 compatibility. Limits names to 31 characters in length. Names can include the letters A to Z, the numer-als 0 to 9, and the special characters dollar sign ($), under-score (_), and hyphen (-).
1 = AutoCAD 2000. Names can be up to 255 characters in length, and can include the letters A to Z, the numerals 0 to 9, spaces, and any special characters not used for other purposes by Microsoft Windows and AutoCAD</td></tr><tr><td>$FILLETRAD</td><td>40</td><td>Fillet radius</td></tr><tr><td>$FILLMODE</td><td>70</td><td>Fill mode on if nonzero</td></tr><tr><td>$FINGERPRINTGUID</td><td>2</td><td>Set at creation time, uniquely identifies a particular drawing</td></tr><tr><td>$HALOGAP</td><td>280</td><td>Specifies a gap to be displayed where an object is hidden by another object; the value is specified as a percent of one unit and is independent of the zoom level. A haloed line is shortened at the point where it is hidden when HIDE or the Hidden option of SHADEMODE is used</td></tr><tr><td>$HANDSEED</td><td>5</td><td>Next available handle</td></tr><tr><td>$HIDETEXT</td><td>290</td><td>Specifies HIDETEXT system variable:
0 = HIDE ignores text objects when producing the hidden view
1 = HIDE does not ignore text objects</td></tr><tr><td>$HYPERLINKBASE</td><td>1</td><td>Path for all relative hyperlinks in the drawing. If null, the drawing path is used</td></tr></table>

DXF header variables

<table><tr><td>Variable</td><td>Group code</td><td>Description</td></tr><tr><td>$INDEXCTL</td><td>280</td><td>Controls whether layer and spatial indexes are created and saved in drawing files:
0 = No indexes are created
1 = Layer index is created
2 = Spatial index is created
3 = Layer and spatial indexes are created</td></tr><tr><td>$INSBASE</td><td>10, 20, 30</td><td>Insertion base set by BASE command (in WCS)</td></tr><tr><td>$INSUNITS</td><td>70</td><td>Default drawing units for AutoCAD DesignCenter blocks:
0 = Unitless; 1 = Inches; 2 = Feet; 3 = Miles; 4 = Millimeters;
5 = Centimeters; 6 = Meters; 7 = Kilometers; 8 = Microinches;
9 = Mils; 10 = Yards; 11 = Angstroms; 12 = Nanometers;
13 = Microns; 14 = Decimeters; 15 = Decameters;
16 = Hectometers; 17 = Gigameters; 18 = Astronomical units;
19 = Light years; 20 = Parsecs</td></tr><tr><td>$INTERFERECOLOR</td><td>62</td><td>Represents the ACI color index of the &quot;interference objects&quot; created during the interfere command. Default value is 1</td></tr><tr><td>$INTERFEREOBJVS</td><td>345</td><td>Hard-pointer ID to the visual style for interference objects. Default visual style is Conceptual.</td></tr><tr><td>$INTERFEREVPVS</td><td>346</td><td>Hard-pointer ID to the visual style for the viewport during interference checking. Default visual style is 3d Wireframe.</td></tr><tr><td>$INTERSECTIONCOLOR</td><td>70</td><td>Specifies the entity color of intersection polylines: Values 1-255 designate an AutoCAD color index (ACI)
0 = Color BYBLOCK
256 = Color BYLAYER
257 = Color BYENTITY</td></tr><tr><td>$INTERSECTIONDISPLAY</td><td>290</td><td>Specifies the display of intersection polylines:
0 = Turns off the display of intersection polylines
1 = Turns on the display of intersection polylines</td></tr><tr><td>$JOINSTYLE</td><td>280</td><td>Lineweight joint setting for new objects:
0=none; 1=round; 2=angle; 3=flat</td></tr></table>

DXF header variables

<table><tr><td>Variable</td><td>Group code</td><td>Description</td></tr><tr><td>$LIMCHECK</td><td>70</td><td>Nonzero if limits checking is on</td></tr><tr><td>$LIMMAX</td><td>10, 20</td><td>XY drawing limits upper-right corner (in WCS)</td></tr><tr><td>$LIMMIN</td><td>10, 20</td><td>XY drawing limits lower-left corner (in WCS)</td></tr><tr><td>$LTSCALE</td><td>40</td><td>Global linetype scale</td></tr><tr><td>$LUNITS</td><td>70</td><td>Units format for coordinates and distances</td></tr><tr><td>$LUPREC</td><td>70</td><td>Units precision for coordinates and distances</td></tr><tr><td>$LWDISPLAY</td><td>290</td><td>Controls the display of lineweights on the Model or Layout tab:
0 = Lineweight is not displayed
1 = Lineweight is displayed</td></tr><tr><td>$MAXACTVP</td><td>70</td><td>Sets maximum number of viewports to be regenerated</td></tr><tr><td>$MEASUREMENT</td><td>70</td><td>Sets drawing units: 0 = English; 1 = Metric</td></tr><tr><td>$MENU</td><td>1</td><td>Name of menu file</td></tr><tr><td>$MIRRTEXT</td><td>70</td><td>Mirror text if nonzero</td></tr><tr><td>$OBSCOLOR</td><td>70</td><td>Specifies the color of obscured lines. An obscured line is a hidden line made visible by changing its color and linetype and is visible only when the Hide or SHADEMODE command is used. The OBSUREDCOLOR setting is visible only if the OBSUREDLTYPE is turned ON by setting it to a value other than 0.
0 and 256 = Entity color
1-255 = An AutoCAD color index (ACI)</td></tr><tr><td>$OBSLTYPE</td><td>280</td><td>Specifies the linetype of obscured lines. Obscured linetypes are independent of zoom level, unlike regular AutoCAD linetypes. Value 0 turns off display of obscured lines and is the default. Linetype values are defined as follows:
0 = Off
1 = Solid</td></tr></table>

DXF header variables

<table><tr><td>Variable</td><td>Group code</td><td>Description</td></tr><tr><td></td><td></td><td>2 = Dashed</td></tr><tr><td></td><td></td><td>3 = Dotted</td></tr><tr><td></td><td></td><td>4 = Short Dash</td></tr><tr><td></td><td></td><td>5 = Medium Dash</td></tr><tr><td></td><td></td><td>6 = Long Dash</td></tr><tr><td></td><td></td><td>7 = Double Short Dash</td></tr><tr><td></td><td></td><td>8 = Double Medium Dash</td></tr><tr><td></td><td></td><td>9 = Double Long Dash</td></tr><tr><td></td><td></td><td>10 = Medium Long Dash</td></tr><tr><td></td><td></td><td>11 = Sparse Dot</td></tr><tr><td>$ORTHOMODE</td><td>70</td><td>Ortho mode on if nonzero</td></tr><tr><td>$PDMODE</td><td>70</td><td>Point display mode</td></tr><tr><td>$PDSIZE</td><td>40</td><td>Point display size</td></tr><tr><td>$PELEVATION</td><td>40</td><td>Current paper space elevation</td></tr><tr><td>$PEXTMAX</td><td>10, 20, 30</td><td>Maximum X, Y, and Z extents for paper space</td></tr><tr><td>$PEXTMIN</td><td>10, 20, 30</td><td>Minimum X, Y, and Z extents for paper space</td></tr><tr><td>$PINSBASE</td><td>10, 20, 30</td><td>Paper space insertion base point</td></tr><tr><td>$PLIMCHECK</td><td>70</td><td>Limits checking in paper space when nonzero</td></tr><tr><td>$PLIMMAX</td><td>10, 20</td><td>Maximum X and Y limits in paper space</td></tr><tr><td>$PLIMMIN</td><td>10, 20</td><td>Minimum X and Y limits in paper space</td></tr><tr><td>$PLINEGEN</td><td>70</td><td>Governs the generation of linetype patterns around the vertices of a 2D polyline:
1 = Linetype is generated in a continuous pattern around vertices of the polyline
0 = Each segment of the polyline starts and ends with a dash</td></tr><tr><td>$PLINEWID</td><td>40</td><td>Default polyline width</td></tr></table>

DXF header variables

<table><tr><td>Variable</td><td>Group code</td><td>Description</td></tr><tr><td>$PROJECTNAME</td><td>1</td><td>Assigns a project name to the current drawing. Used when an external reference or image is not found on its original path. The project name points to a section in the registry that can contain one or more search paths for each project name defined. Project names and their search directories are created from the Files tab of the Options dialog box</td></tr><tr><td>$PROXYGRAPHICS</td><td>70</td><td>Controls the saving of proxy object images</td></tr><tr><td>$PSLTSCALE</td><td>70</td><td>Controls paper space linetype scaling:
1 = No special linetype scaling
0 = Viewport scaling governs linetype scaling</td></tr><tr><td>$PSTYLEMODE</td><td>290</td><td>Indicates whether the current drawing is in a Color-Dependent or Named Plot Style mode:
0 = Uses named plot style tables in the current drawing
1 = Uses color-dependent plot style tables in the current drawing</td></tr><tr><td>$PSVPSCALE</td><td>40</td><td>View scale factor for new viewports:
0 = Scaled to fit
&gt;0 = Scale factor (a positive real value)</td></tr><tr><td>$PUCSBASE</td><td>2</td><td>Name of the UCS that defines the origin and orientation of orthographic UCS settings (paper space only)</td></tr><tr><td>$PUCSNAME</td><td>2</td><td>Current paper space UCS name</td></tr><tr><td>$PUCSORG</td><td>10, 20, 30</td><td>Current paper space UCS origin</td></tr><tr><td>$PUCSORGBACK</td><td>10, 20, 30</td><td>Point which becomes the new UCS origin after changing paper space UCS to BACK when PUCSBASE is set to WORLD</td></tr><tr><td>$PUCSORGBottom</td><td>10, 20, 30</td><td>Point which becomes the new UCS origin after changing paper space UCS to BOTTOM when PUCSBASE is set to WORLD</td></tr><tr><td>$PUCSORGFRONT</td><td>10, 20, 30</td><td>Point which becomes the new UCS origin after changing paper space UCS to FRONT when PUCSBASE is set to WORLD</td></tr></table>

DXF header variables

<table><tr><td>Variable</td><td>Group code</td><td>Description</td></tr><tr><td>$PUCSORGLEFT</td><td>10, 20, 30</td><td>Point which becomes the new UCS origin after changing paper space UCS to LEFT when PUCSBASE is set to WORLD</td></tr><tr><td>$PUCSORGRIGHT</td><td>10, 20, 30</td><td>Point which becomes the new UCS origin after changing paper space UCS to RIGHT when PUCSBASE is set to WORLD</td></tr><tr><td>$PUCSORGTOP</td><td>10, 20, 30</td><td>Point which becomes the new UCS origin after changing paper space UCS to TOP when PUCSBASE is set to WORLD</td></tr><tr><td>$PUCSORTHOREF</td><td>2</td><td>If paper space UCS is orthographic (PUCSORTHOVIEW not equal to 0), this is the name of the UCS that the orthographic UCS is relative to. If blank, UCS is relative to WORLD</td></tr><tr><td>$PUCSORTHOVIEW</td><td>70</td><td>Orthographic view type of paper space UCS:
0 = UCS is not orthographic;
1 = Top; 2 = Bottom;
3 = Front; 4 = Back;
5 = Left; 6 = Right</td></tr><tr><td>$PUCSXDIR</td><td>10, 20, 30</td><td>Current paper space UCS X axis</td></tr><tr><td>$PUCSYDIR</td><td>10, 20, 30</td><td>Current paper space UCS Y axis</td></tr><tr><td>$QTEXTMODE</td><td>70</td><td>Quick Text mode on if nonzero</td></tr><tr><td>$REGENMODE</td><td>70</td><td>REGENAUTO mode on if nonzero</td></tr><tr><td>$SHADEGE</td><td>70</td><td>0 = Faces shaded, edges not highlighted
1 = Faces shaded, edges highlighted in black
2 = Faces not filled, edges in entity color
3 = Faces in entity color, edges in black</td></tr><tr><td>$SHADEDIF</td><td>70</td><td>Percent ambient/diffuse light; range 1-100; default 70</td></tr><tr><td>$SHADOWPLANELOCA-TION</td><td>40</td><td>Location of the ground shadow plane. This is a Z axis ordin-ate.</td></tr><tr><td>$SKETCHINC</td><td>40</td><td>Sketch record increment</td></tr></table>

DXF header variables

<table><tr><td>Variable</td><td>Group code</td><td>Description</td></tr><tr><td>$SKPOLY</td><td>70</td><td>0 = Sketch lines; 1 = Sketch polylines</td></tr><tr><td>$SORTENTS</td><td>280</td><td>Controls the object sorting methods; accessible from the Options dialog box User Preferences tab. SORTENTS uses the following bitcodes:
0 = Enables SORTENTS
1 = Sorts for object selection
2 = Sorts for object snap
4 = Sorts for redraws
8 = Sorts for MSLIDE command slide creation
16 = Sorts for REGEN commands
32 = Sorts for plotting
64 = Sorts for PostScript output</td></tr><tr><td>$SPLINESEGS</td><td>70</td><td>Number of line segments per spline patch</td></tr><tr><td>$SPLINETYPE</td><td>70</td><td>Spline curve type for PEDIT Spline</td></tr><tr><td>$SURFTAB1</td><td>70</td><td>Number of mesh tabulations in first direction</td></tr><tr><td>$SURFTAB2</td><td>70</td><td>Number of mesh tabulations in second direction</td></tr><tr><td>$SURFTYPE</td><td>70</td><td>Surface type for PEDIT Smooth</td></tr><tr><td>$SURFU</td><td>70</td><td>Surface density (for PEDIT Smooth) in M direction</td></tr><tr><td>$SURFV</td><td>70</td><td>Surface density (for PEDIT Smooth) in N direction</td></tr><tr><td>$TDCREATE</td><td>40</td><td>Local date/time of drawing creation (see “Special Handling of Date/Time Variables”)</td></tr><tr><td>$TDINDWG</td><td>40</td><td>Cumulative editing time for this drawing (see “Special Handling of Date/Time Variables”)</td></tr><tr><td>$TDUCREATE</td><td>40</td><td>Universal date/time the drawing was created (see “Special Handling of Date/Time Variables”)</td></tr><tr><td>$TDUPDATE</td><td>40</td><td>Local date/time of last drawing update (see “Special Handling of Date/Time Variables”)</td></tr></table>

DXF header variables

<table><tr><td>Variable</td><td>Group code</td><td>Description</td></tr><tr><td>$TDUSRTIMER</td><td>40</td><td>User-elapsed timer</td></tr><tr><td>$TDUUPDATE</td><td>40</td><td>Universal date/time of the last update/save (see “Special Handling of Date/Time Variables”)</td></tr><tr><td>$TEXTSIZE</td><td>40</td><td>Default text height</td></tr><tr><td>$TEXTSTYLE</td><td>7</td><td>Current text style name</td></tr><tr><td>$THICKNESS</td><td>40</td><td>Current thickness set by ELEV command</td></tr><tr><td>$ TILEMODE</td><td>70</td><td>1 for previous release compatibility mode; 0 otherwise</td></tr><tr><td>$TRACEWID</td><td>40</td><td>Default trace width</td></tr><tr><td>$TREEDEPTH</td><td>70</td><td>Specifies the maximum depth of the spatial index</td></tr><tr><td>$UCSBASE</td><td>2</td><td>Name of the UCS that defines the origin and orientation of orthographic UCS settings</td></tr><tr><td>$UCSNAME</td><td>2</td><td>Name of current UCS</td></tr><tr><td>$UCSORG</td><td>10, 20, 30</td><td>Origin of current UCS (in WCS)</td></tr><tr><td>$UCSORGBACK</td><td>10, 20, 30</td><td>Point which becomes the new UCS origin after changing model space UCS to BACK when UCSBASE is set to WORLD</td></tr><tr><td>$UCSORGBottom</td><td>10, 20, 30</td><td>Point which becomes the new UCS origin after changing model space UCS to BOTTOM when UCSBASE is set to WORLD</td></tr><tr><td>$UCSORGFRONT</td><td>10, 20, 30</td><td>Point which becomes the new UCS origin after changing model space UCS to FRONT when UCSBASE is set to WORLD</td></tr><tr><td>$UCSORGLEFT</td><td>10, 20, 30</td><td>Point which becomes the new UCS origin after changing model space UCS to LEFT when UCSBASE is set to WORLD</td></tr><tr><td>$UCSORGRIGHT</td><td>10, 20, 30</td><td>Point which becomes the new UCS origin after changing model space UCS to RIGHT when UCSBASE is set to WORLD</td></tr></table>

DXF header variables

<table><tr><td>Variable</td><td>Group code</td><td>Description</td></tr><tr><td>$UCSORGTOP</td><td>10, 20, 30</td><td>Point which becomes the new UCS origin after changing model space UCS to TOP when UCSBASE is set to WORLD</td></tr><tr><td>$UCSORTHREF</td><td>2</td><td>If model space UCS is orthographic (UCSORTHOVIEW not equal to 0), this is the name of the UCS that the orthographic UCS is relative to. If blank, UCS is relative to WORLD</td></tr><tr><td>$UCSORTHOVIEW</td><td>70</td><td>Orthographic view type of model space UCS:
0 = UCS is not orthographic;
1 = Top; 2 = Bottom;
3 = Front; 4 = Back;
5 = Left; 6 = Right</td></tr><tr><td>$UCSXDIR</td><td>10, 20, 30</td><td>Direction of the current UCS X axis (in WCS)</td></tr><tr><td>$UCSYDIR</td><td>10, 20, 30</td><td>Direction of the current UCS Y axis (in WCS)</td></tr><tr><td>$UNITMODE</td><td>70</td><td>Low bit set = Display fractions, feet-and-inches, and survey-or&#x27;s angles in input format</td></tr><tr><td>$USERI1 - 5</td><td>70</td><td>Five integer variables intended for use by third-party developers</td></tr><tr><td>$USERR1 - 5</td><td>40</td><td>Five real variables intended for use by third-party developers</td></tr><tr><td>$USRTIMER</td><td>70</td><td>0 = Timer off; 1 = Timer on</td></tr><tr><td>$VERSIONGUID</td><td>2</td><td>Uniquely identifies a particular version of a drawing. Up-dated when the drawing is modified</td></tr><tr><td>$VISRETAIN</td><td>70</td><td>0 = Don&#x27;t retain xref-dependent visibility settings
1 = Retain xref-dependent visibility settings</td></tr><tr><td>$WORLDVIEW</td><td>70</td><td>1 = Set UCS to WCS during DVIEW/VPOINT
0 = Don&#x27;t change UCS</td></tr><tr><td>$XCLIPFRAME</td><td>290</td><td>Controls the visibility of xref clipping boundaries:
0 = Clipping boundary is not visible
1 = Clipping boundary is visible</td></tr></table>

DXF header variables

<table><tr><td>Variable</td><td>Group code</td><td>Description</td></tr><tr><td>$XEDIT</td><td>290</td><td>Controls whether the current drawing can be edited in-place when being referenced by another drawing.
0 = Can&#x27;t use in-place reference editing
1 = Can use in-place reference editing</td></tr></table>

# Revised VPORT Header Variables

The following header variables existed before AutoCAD® Release 11 but now have independent settings for each active viewpoint. OPEN honors these variables when read from  $\mathrm{DXF}^{\mathrm{TM}}$  files. If a VPORT symbol table with *ACTIVE entries is present (as is true for any DXF file produced by Release 11 or later), the values in the VPORT table entries override the values of these header variables.

Revised VPORT header variables

<table><tr><td>Variable</td><td>Group code</td><td>Description</td></tr><tr><td>$FASTZOOM</td><td>70</td><td>Fast zoom enabled if nonzero</td></tr><tr><td>$GRIDMODE</td><td>70</td><td>Grid mode on if nonzero</td></tr><tr><td>$GRIDUNIT</td><td>10, 20</td><td>Grid X and Y spacing</td></tr><tr><td>$SNAPANG</td><td>50</td><td>Snap grid rotation angle</td></tr><tr><td>$SNAPBASE</td><td>10, 20</td><td>Snap/grid base point (in UCS)</td></tr><tr><td>$SNAPISOPAIR</td><td>70</td><td>Isometric plane: 0 = Left; 1 = Top; 2 = Right</td></tr><tr><td>$SNAPMODE</td><td>70</td><td>Snap mode on if nonzero</td></tr><tr><td>$SNAPSTYLE</td><td>70</td><td>Snap style: 0 = Standard; 1 = Isometric</td></tr><tr><td>$SNAPUNIT</td><td>10, 20</td><td>Snap grid X and Y spacing</td></tr><tr><td>$VIEWCTR</td><td>10, 20</td><td>XY center of current view on screen</td></tr></table>

Revised VPORT header variables

<table><tr><td>Variable</td><td>Group code</td><td>Description</td></tr><tr><td>$VIEWDIR</td><td>10, 20, 30</td><td>Viewing direction (direction from target in WCS)</td></tr><tr><td>$VIEWSIZE</td><td>40</td><td>Height of view</td></tr></table>

# Special Handling of Date/Time Variables

The CDATE and DATE system variables provide access to the current date and time. The TDCREATE, TDINDWG, TDUPDATE, and TDUSRTIMER system variables (and the $TDCREATE, $TDUCREATE, $TDUPDATE, and $TDUUPDATE DXF header variables) provide access to times and dates associated with the current drawing. The values are represented as real numbers with special meanings, as described below.

DATE is the current date and time represented as a Julian date and fraction of a day in a real number.

<Julian date>.<Fraction of day>

For example, on December 31, 1999, at 9:58:35 p.m. GMT, the DATE variable contains

2451544.91568287

The date and time are taken from the computer's clock when the variable is read. The time is represented as a fraction of a day, and the times returned by DATE may be truly subtracted to compute differences in time. To extract the seconds since midnight from the value returned by DATE, use the AutoLISP expressions

(setq s (getvar "DATE"))

(setq seconds (* 86400.0 (-s (fix s))))

Note that DATE returns only a true Julian date if the system's clock is set to UTC/Zulu (Greenwich Mean Time). TDCREATE and TDUPDATE have the same format as DATE, but their values represent the creation time and last update time of the current drawing.

TDINDWG and TDUSRTIMER (and the $TDINDWG and $TDUSRTIMER DXF header variables) use a format similar to that of DATE, but their values represent elapsed times, as in

<Number of days>.<Fraction of day>

CDATE is the current date and time in calendar and clock format. The value is returned as a real number in the form

YYYYMMDD.HHMMSShsec

where

$\mathrm{YYYY} =$  year

MM = month (01-12)

$\mathrm{DD} = \mathrm{day}$  (01-31)

$\mathrm{HH} =$  hour (00-23)

MM = minute (00-59)

$\mathrm{SS} =$  second (00-59)

hsec = hundredths of a second (00-99)

For example, if the current date is December 31, 2005, and the time is 9:58:35.75 p.m., CDATE would return the value:

20051231.21583575

Note that CDATE values can be compared for later and earlier values but that subtracting them yields numbers that are not meaningful.

# CLASSES Section

# 3

The group codes described in this chapter are found only in  $\mathrm{DXF}^{\mathrm{TM}}$  files. The CLASSES section holds the information for application-defined classes whose instances appear in the BLOCKS, ENTITIES, and OBJECTS sections of the database. It is assumed that a class definition is permanently fixed in the class hierarchy. All fields are required.

# CLASSES Section Group Codes

Each entry in the CLASSES section contains the groups described in the following table.

# CLASSES section group codes

# Group code Description

0 Record type (CLASS). Identifies beginning of a CLASS record
1 Class DXF record name; always unique
2 C++ class name. Used to bind with software that defines object class behavior; always unique
3 Application name. Posted in Alert box when a class definition listed in this section is not currently loaded
90 Proxy capabilities flag. Bit-coded value that indicates the capabilities of this object as a proxy:

$0 = \mathrm{No}$  operations allowed (0)
$1 =$  Erase allowed  $(0\times 1)$
$2 =$  Transform allowed  $(0\times 2)$
$4 =$  Color change allowed  $(0\times 4)$
$8 =$  Layer change allowed  $(0\times 8)$

# CLASSES section group codes

# Group code Description

<table><tr><td></td><td>16 = Linetype change allowed (0x10)</td></tr><tr><td></td><td>32 = Linetype scale change allowed (0x20)</td></tr><tr><td></td><td>64 = Visibility change allowed (0x40)</td></tr><tr><td></td><td>128 = Cloning allowed (0x80)</td></tr><tr><td></td><td>256 = Lineweight change allowed (0x100)</td></tr><tr><td></td><td>512 = Plot Style Name change allowed (0x200)</td></tr><tr><td></td><td>895 = All operations except cloning allowed (0x37F)</td></tr><tr><td></td><td>1023 = All operations allowed (0x3FF)</td></tr><tr><td></td><td>1024 = Disabilities proxy warning dialog (0x400)</td></tr><tr><td></td><td>32768 = R13 format proxy (0x8000)</td></tr><tr><td>91</td><td>Instance count for a custom class</td></tr><tr><td>280</td><td>Was-a-proxy flag. Set to 1 if class was not loaded when this DXF file was created, and 0 otherwise</td></tr><tr><td>281</td><td>Is-an-entity flag. Set to 1 if class was derived from the AcDbEntity class and can reside in the BLOCKS or ENTITIES section. If 0, instances may appear only in the OBJECTS section</td></tr></table>

# Default Class Values

AutoCAD® registers the classes listed in the following table. (This may not be a complete list of the classes found in a DXF file. It depends on the applications currently in use by AutoCAD.)

# Default class values

<table><tr><td>DXF record name code 1</td><td>C++ class name code 2</td><td>Code 90</td><td>Code 280</td><td>Code 281</td></tr><tr><td>ACDBDICTIONARYWDFLT</td><td>AcDbDictionaryWithDefault</td><td>0</td><td>0</td><td>0</td></tr><tr><td>ACDBPLACEHOLDER</td><td>AcDbPlaceHolder</td><td>0</td><td>0</td><td>0</td></tr><tr><td>ARCALIGNEDTEXT</td><td>AcDbArcAlignedText</td><td>0</td><td>0</td><td>1</td></tr><tr><td>DICTIONARYVAR</td><td>AcDbDictionaryVar</td><td>0</td><td>0</td><td>0</td></tr><tr><td>HATCH</td><td>AcDbHatch</td><td>0</td><td>0</td><td>1</td></tr><tr><td colspan="5">Default class values</td></tr><tr><td>DXF record name code 1</td><td>C++ class name code 2</td><td>Code 90</td><td>Code 280</td><td>Code 281</td></tr><tr><td>IDBUFFER</td><td>AcDbldBuffer</td><td>0</td><td>0</td><td>0</td></tr><tr><td>IMAGE</td><td>AcDbRasterImage</td><td>127</td><td>0</td><td>1</td></tr><tr><td>IMAGEDEF</td><td>AcDbRasterImageDef</td><td>0</td><td>0</td><td>0</td></tr><tr><td>IMAGEDEF_REACTOR</td><td>AcDbRasterImageDefReactor</td><td>1</td><td>0</td><td>0</td></tr><tr><td>LAYER_INDEX</td><td>AcDbLayerIndex</td><td>0</td><td>0</td><td>0</td></tr><tr><td>LAYOUT</td><td>AcDbLayout</td><td>0</td><td>0</td><td>0</td></tr><tr><td>LWPOLYLINE</td><td>AcDbPolyline</td><td>0</td><td>0</td><td>1</td></tr><tr><td>OBJECT_PTR</td><td>CAseDLPNTableRecord</td><td>1</td><td>0</td><td>0</td></tr><tr><td>OLE2FRAME</td><td>AcDbOle2Frame</td><td>0</td><td>0</td><td>1</td></tr><tr><td>PLOT SETTINGS</td><td>AcDbPlotSettings</td><td>0</td><td>0</td><td>0</td></tr><tr><td>RASTERVARIABLES</td><td>AcDbRasterVariables</td><td>0</td><td>0</td><td>0</td></tr><tr><td>RTEXT</td><td>RText</td><td>0</td><td>0</td><td>1</td></tr><tr><td>SORTENTSTABLE</td><td>AcDbSortentsTable</td><td>0</td><td>0</td><td>0</td></tr><tr><td>SPATIAL_INDEX</td><td>AcDbSpatialIndex</td><td>0</td><td>0</td><td>0</td></tr><tr><td>SPATIAL_FILTER</td><td>AcDbSpatialFilter</td><td>0</td><td>0</td><td>0</td></tr><tr><td>WIPEOUT</td><td>AcDbWipeout</td><td>127</td><td>0</td><td>1</td></tr><tr><td>WIPEOUTVARIABLES</td><td>AcDbWipeoutVariables</td><td>0</td><td>0</td><td>0</td></tr></table>

# TABLES Section

# 4

The group codes described in this chapter are found in  $\mathrm{DXF}^{\mathrm{TM}}$  files and used by applications. The TABLES section contains several tables, each of which can contain a variable number of entries. These codes are also used by AutoLISP® and ObjectARX® applications in entity definition lists.

# Symbol Table Group Codes

The order of the tables may change, but the LTYPE table always precedes the LAYER table. Each table is introduced with a 0 group code with the label TABLE. This is followed by a 2 group code identifying the particular table (APPID, DIMSTYLE, LAYER, LTYPE, STYLE, UCS, VIEW, VPORT, or BLOCK_record), a 5 group code (a handle), a 100 group code (AcDbSymbolTable subclass marker), and a 70 group code that specifies the maximum number of table entries that may follow. Table names are output in uppercase. The DIMSTYLE handle is a 105 group code, and not a 5 group code.

The tables in a drawing can contain deleted items, but these are not written to the DXF file. As a result, fewer table entries may follow the table header than are indicated by the 70 group code, so do not use the count in the 70 group code as an index to read in the table. This group code is provided so that a program that reads DXF files can allocate an array large enough to hold all the table entries that follow.

Following this header for each table are the table entries. Each table entry consists of a 0 group identifying the item type (same as table name, such as LTYPE or LAYER), a 2 group giving the name of the table entry, a 70 group specifying flags relevant to the table entry (defined for each following table), and additional groups that give the value of the table entry. The end of each table is indicated by a 0 group with the value ENDTAB.

Both symbol table records and symbol tables are database objects. At a very minimum, with all prevailing usage within AutoCAD®, this implies that a handle

is present, positioned after the 2 group codes for both the symbol table record objects and the symbol table objects.

The DIMSTYLE table is the only record type in the system with a handle code of 105 because of its earlier usage of group code 5. As a rule, programmers should not be concerned about this exception unless it is in the context of the DIMSTYLE table section. This is the only context in which this exception should occur.

# Common Symbol Table Group Codes

The following table shows group codes that apply to all symbol tables. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">Group codes that apply to all symbol tables</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>-1</td><td>APP: entity name (changes each time a drawing is opened)</td></tr><tr><td>0</td><td>Object type (TABLE)</td></tr><tr><td>2</td><td>Table name</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>“{ACAD_XDICTIONARY” indicates the start of an extension dictionary group. This group exists only if persistent reactors have been attached to this object (optional)</td></tr><tr><td>360</td><td>Hard owner ID/handle to owner dictionary (optional)</td></tr><tr><td>102</td><td>End of group, “}” (optional)</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner object</td></tr><tr><td>100</td><td>Subclass marker (AcDb SYMBOLTable)</td></tr><tr><td>70</td><td>Maximum number of entries in table</td></tr></table>

# Common Group Codes for Symbol Table Entries

The following table shows group codes that apply to all symbol table entries. When you refer to the table of group codes by entity type, which lists the codes associated with specific entities, keep in mind that the codes shown here can also be present. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">Group codes that apply to all symbol table entries</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>-1</td><td>APP: entity name (changes each time a drawing is opened)</td></tr><tr><td>0</td><td>Entity type (table name)</td></tr><tr><td>5</td><td>Handle (all except DIMSTYLE)</td></tr><tr><td>105</td><td>Handle (DIMSTYLE table only)</td></tr><tr><td>102</td><td>Start of application-defined group &quot;\(application_name&quot; . For example, &quot;\{ACAD_REACTORS&quot; indicates the start of the AutoCAD persistent reactors group (optional)</td></tr><tr><td>application-defined codes</td><td>Codes and values within the 102 groups are application defined (optional)</td></tr><tr><td>102</td><td>End of group, &quot;\}&quot; (optional)</td></tr><tr><td>102</td><td>&quot;\{ACAD_REACTORS&quot; indicates the start of the AutoCAD persistent reactors group. This group exists only if persistent reactors have been attached to this object (optional)</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary (optional)</td></tr><tr><td>102</td><td>End of group, &quot;\}&quot; (optional)</td></tr><tr><td>102</td><td>&quot;\{ACAD_XDICTIONARY&quot; indicates the start of an extension dictionary group. This group exists only if persistent reactors have been attached to this object (optional)</td></tr><tr><td>360</td><td>Hard-owner ID/handle to owner dictionary (optional)</td></tr><tr><td>102</td><td>End of group, &quot;\}&quot; (optional)</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner object</td></tr></table>

# Group codes that apply to all symbol table entries

# Group code Description

100 Subclass marker (AcDbSymbolTableRecord)

# APPID

The following group codes apply to APPID symbol table entries. In addition to the group codes described here, see Common Group Codes for Symbol Table Entries on page 37. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

# APPID group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbRegAppTableRecord)</td></tr><tr><td>2</td><td>User-supplied (or application-supplied) application name (for extended data). These table entries maintain a set of names for all registered applications</td></tr><tr><td>70</td><td>Standard flag values (bit-coded values):
16 = If set, table entry is externally dependent on an xref
32 = If both this bit and bit 16 are set, the externally dependent xref has been successfully resolved
64 = If set, the table entry was referenced by at least one entity in the drawing the last time the drawing was edited. (This flag is for the benefit of AutoCAD commands. It can be ignored by most programs that read DXF files and need not be set by programs that write DXF files)</td></tr></table>

# BLOCK RECORD

The following group codes apply to BLOCK RECORD symbol table entries. In addition to the group codes described here, see Common Group Codes for Symbol Table Entries on page 37. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

# BLOCK_RECORD group codes

# Group code Description

100 Subclass marker (AcDbBlockTableRecord)

<table><tr><td colspan="2">BLOCK RECORD group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>2</td><td>Block name</td></tr><tr><td>340</td><td>Hard-pointer ID/handle to associated LAYOUT object</td></tr><tr><td>70</td><td>Block insertion units.</td></tr><tr><td>280</td><td>Block explodability</td></tr><tr><td>281</td><td>Block scalability</td></tr><tr><td>310</td><td>DXF: Binary data for bitmap preview (optional)</td></tr><tr><td>1001</td><td>Xdata application name “ACAD” (optional)</td></tr><tr><td>1000</td><td>Xdata string data “DesignCenter Data” (optional)</td></tr><tr><td>1002</td><td>Begin xdata “[” (optional)</td></tr><tr><td>1070</td><td>Autodesk Design Center version number</td></tr><tr><td>1070</td><td>Insert units:
0 = Unitless; 1 = Inches; 2 = Feet; 3 = Miles; 4 = Millimeters;
5 = Centimeters; 6 = Meters; 7 = Kilometers; 8 = Microinches;
9 = Mils; 10 = Yards; 11 = Angstroms; 12 = Nanometers;
13 = Microns; 14 = Decimeters; 15 = Decameters;
16 = Hectometers; 17 = Gigameters; 18 = Astronomical units;
19 = Light years; 20 = Parsecs</td></tr><tr><td>1002</td><td>End xdata “}”</td></tr></table>

# DIMSTYLE

The following group codes apply to DIMSTYLE symbol table entries. The DIMSTYLE system variables are described in "System Variables," in the Command Reference. In addition to the group codes described here, see Common Group Codes for Symbol Table Entries on page 37. For information about

abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">DIMSTYLE group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbDimStyleTableRecord)</td></tr><tr><td>2</td><td>Dimension style name</td></tr><tr><td>70</td><td>Standard flag values (bit-coded values):
16 = If set, table entry is externally dependent on an xref
32 = If both this bit and bit 16 are set, the externally dependent xref has been successfully re-solved
64 = If set, the table entry was referenced by at least one entity in the drawing the last time the drawing was edited. (This flag is for the benefit of AutoCAD commands. It can be ignored by most programs that read DXF files and need not be set by programs that write DXF files)</td></tr><tr><td>3</td><td>DIMPOST</td></tr><tr><td>4</td><td>DIMAPOST</td></tr><tr><td>5</td><td>DIMBLK (obsolete, now object ID)</td></tr><tr><td>6</td><td>DIMBLK1 (obsolete, now object ID)</td></tr><tr><td>7</td><td>DIMBLK2 (obsolete, now object ID)</td></tr><tr><td>40</td><td>DIMSCALE</td></tr><tr><td>41</td><td>DIMASZ</td></tr><tr><td>42</td><td>DIMEXO</td></tr><tr><td>43</td><td>DIMDLI</td></tr><tr><td>44</td><td>DIMEXE</td></tr><tr><td>45</td><td>DIMRND</td></tr><tr><td>46</td><td>DIMDLE</td></tr><tr><td>47</td><td>DIMTP</td></tr><tr><td>48</td><td>DIMTM</td></tr><tr><td>140</td><td>DIMTXT</td></tr><tr><td>141</td><td>DIMCEN</td></tr><tr><td>142</td><td>DIMTSZ</td></tr><tr><td>143</td><td>DIMALTF</td></tr><tr><td>144</td><td>DIMLFAC</td></tr><tr><td>145</td><td>DIMTVP</td></tr><tr><td>146</td><td>DIMTFAC</td></tr><tr><td>147</td><td>DIMGAP</td></tr><tr><td>148</td><td>DIMALTRND</td></tr><tr><td>71</td><td>DIMTOL</td></tr><tr><td>72</td><td>DIMLIM</td></tr><tr><td>73</td><td>DIMTIH</td></tr><tr><td>74</td><td>DIMTOH</td></tr><tr><td>75</td><td>DIMSE1</td></tr><tr><td>76</td><td>DIMSE2</td></tr><tr><td>77</td><td>DIMTAD</td></tr><tr><td>78</td><td>DIMZIN</td></tr><tr><td>79</td><td>DIMAZIN</td></tr><tr><td>170</td><td>DIMALT</td></tr><tr><td>171</td><td>DIMALTD</td></tr><tr><td>172</td><td>DIMTOFL</td></tr><tr><td>173</td><td>DIMSAH</td></tr><tr><td>174</td><td>DIMTIX</td></tr><tr><td>175</td><td>DIMSOXD</td></tr><tr><td>176</td><td>DIMCLRD</td></tr><tr><td>177</td><td>DIMCLRE</td></tr><tr><td>178</td><td>DIMCLRT</td></tr><tr><td>179</td><td>DIMADEC</td></tr><tr><td>270</td><td>DIMUNIT (obsolete, now use DIMLUNIT AND DIMFRAC)</td></tr><tr><td>271</td><td>DIMDEC</td></tr><tr><td>272</td><td>DIMTDEC</td></tr><tr><td>273</td><td>DIMALTU</td></tr><tr><td>274</td><td>DIMALTTD</td></tr><tr><td>275</td><td>DIMAUNIT</td></tr><tr><td>276</td><td>DIMFRAC</td></tr><tr><td>277</td><td>DIMLUNIT</td></tr><tr><td>278</td><td>DIMDSEP</td></tr><tr><td>279</td><td>DIMTMOVE</td></tr><tr><td>280</td><td>DIMJUST</td></tr><tr><td>281</td><td>DIMSD1</td></tr><tr><td>282</td><td>DIMSD2</td></tr><tr><td>283</td><td>DIMTOLJ</td></tr><tr><td>284</td><td>DIMTZIN</td></tr><tr><td>285</td><td>DIMALTZ</td></tr><tr><td>286</td><td>DIMALTTZ</td></tr><tr><td>287</td><td>DIMFIT (obsolete, now use DIMATFIT and DIMTMOVE)</td></tr><tr><td>288</td><td>DIMUPT</td></tr><tr><td>289</td><td>DIMATFIT</td></tr><tr><td>340</td><td>DIMTXSTY (handle of referenced STYLE)</td></tr><tr><td>341</td><td>DIMLDRBLK (handle of referenced BLOCK)</td></tr><tr><td>342</td><td>DIMBLK (handle of referenced BLOCK)</td></tr><tr><td>343</td><td>DIMBLK1 (handle of referenced BLOCK)</td></tr><tr><td>344</td><td>DIMBLK2 (handle of referenced BLOCK)</td></tr><tr><td>371</td><td>DIMLWD (lineweight enum value)</td></tr><tr><td>372</td><td>DIMLWE (lineweight enum value)</td></tr></table>

# LAYER

The following group codes apply to LAYER symbol table entries. In addition to the group codes described here, see Common Group Codes for Symbol

Table Entries on page 37. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">LAYER group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbLayerTableRecord)</td></tr><tr><td>2</td><td>Layer name</td></tr><tr><td>70</td><td>Standard flags (bit-coded values):
1 = Layer is frozen; otherwise layer is thawed
2 = Layer is frozen by default in new viewports
4 = Layer is locked
16 = If set, table entry is externally dependent on an xref
32 = If both this bit and bit 16 are set, the externally dependent xref has been successfully resolved
64 = If set, the table entry was referenced by at least one entity in the drawing the last time the drawing was edited. (This flag is for the benefit of AutoCAD commands. It can be ignored by most programs that read DXF files and need not be set by programs that write DXF files)</td></tr><tr><td>62</td><td>Color number (if negative, layer is off)</td></tr><tr><td>6</td><td>Linetype name</td></tr><tr><td>290</td><td>Plotting flag. If set to 0, do not plot this layer</td></tr><tr><td>370</td><td>Lineweight enum value</td></tr><tr><td>390</td><td>Hard-pointer ID/handle of PlotStyleName object</td></tr><tr><td>347</td><td>Hard-pointer ID/handle to Material object</td></tr></table>

Xref-dependent layers are output during SAVEAS. For these layers, the associated linetype name in the DXF file is always CONTINUOUS.

# TYPE

The following group codes apply to LTYPE symbol table entries. In addition to the group codes described here, see Common Group Codes for Symbol

Table Entries on page 37. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">LTYPE group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbLinetypeTableRecord)</td></tr><tr><td>2</td><td>Linetype name</td></tr><tr><td>70</td><td>Standard flag values (bit-coded values):
16 = If set, table entry is externally dependent on an xref
32 = If both this bit and bit 16 are set, the externally dependent xref has been successfully re-solved
64 = If set, the table entry was referenced by at least one entity in the drawing the last time the drawing was edited. (This flag is for the benefit of AutoCAD commands. It can be ignored by most programs that read DXF files and need not be set by programs that write DXF files)</td></tr><tr><td>3</td><td>Descriptive text for linetype</td></tr><tr><td>72</td><td>Alignment code; value is always 65, the ASCII code for A</td></tr><tr><td>73</td><td>The number of linetype elements</td></tr><tr><td>40</td><td>Total pattern length</td></tr><tr><td>49</td><td>Dash, dot or space length (one entry per element)</td></tr><tr><td>74</td><td>Complex linetype element type (one per element). Default is 0 (no embedded shape/text)
The following codes are bit values:
1 = If set, code 50 specifies an absolute rotation; if not set, code 50 specifies a relative rotation
2 = Embedded element is a text string
4 = Embedded element is a shape</td></tr><tr><td>75</td><td>Shape number (one per element) if code 74 specifies an embedded shape
If code 74 specifies an embedded text string, this value is set to 0
If code 74 is set to 0, code 75 is omitted</td></tr><tr><td>340</td><td>Pointer to STYLE object (one per element if code 74 &gt; 0)</td></tr><tr><td>46</td><td>S = Scale value (optional); multiple entries can exist</td></tr></table>

# LTYPE group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>50</td><td>R = (relative) or A = (absolute) rotation value in radians of embedded shape or text; one per element if code 74 specifies an embedded shape or text string</td></tr><tr><td>44</td><td>X = X offset value (optional); multiple entries can exist</td></tr><tr><td>45</td><td>Y = Y offset value (optional); multiple entries can exist</td></tr><tr><td>9</td><td>Text string (one per element if code 74 = 2)</td></tr></table>

The group codes 74, 75, 340, 46, 50, 44, 45, and 9 are not returned by the tblsearch or tblnext functions. You must use tblobjname to retrieve these values within an application.

# STYLE

The following group codes apply to STYLE symbol table entries. In addition to the group codes described here, see Common Group Codes for Symbol Table Entries on page 37. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

# STYLE group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbTextStyleTableRecord)</td></tr><tr><td>2</td><td>Style name</td></tr><tr><td>70</td><td>Standard flag values (bit-coded values):
1 = If set, this entry describes a shape
4 = Vertical text
16 = If set, table entry is externally dependent on an xref
32 = If both this bit and bit 16 are set, the externally dependent xref has been successfully resolved
64 = If set, the table entry was referenced by at least one entity in the drawing the last time the drawing was edited. (This flag is for the benefit of AutoCAD commands. It can be ignored by most programs that read DXF files and need not be set by programs that write DXF files)</td></tr><tr><td>40</td><td>Fixed text height; 0 if not fixed</td></tr><tr><td colspan="2">STYLE group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>41</td><td>Width factor</td></tr><tr><td>50</td><td>Oblique angle</td></tr><tr><td>71</td><td>Text generation flags:
2 = Text is backward (mirrored in X)
4 = Text is upside down (mirrored in Y)</td></tr><tr><td>42</td><td>Last height used</td></tr><tr><td>3</td><td>Primary font file name</td></tr><tr><td>4</td><td>Bigfont file name; blank if none</td></tr><tr><td>1071</td><td>A long value which contains a truetype font's pitch and family, charset, and italic and bold flags</td></tr></table>

A STYLE table item is also used to record shape file LOAD command requests. In this case the first bit (1) is set in the 70 group flags and only the 3 group (shape file name) is meaningful (all the other groups are output, however).

# UCS

The following group codes apply to UCS symbol table entries. In addition to the group codes described here, see Common Group Codes for Symbol Table Entries on page 37. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">UCS group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbUCSTableRecord)</td></tr><tr><td>2</td><td>UCS name</td></tr><tr><td>70</td><td>Standard flag values (bit-coded values):
16 = If set, table entry is externally dependent on an xref
32 = If both this bit and bit 16 are set, the externally dependent xref has been successfully re-solved</td></tr><tr><td></td><td>64 = If set, the table entry was referenced by at least one entity in the drawing the last time the drawing was edited. (This flag is for the benefit of AutoCAD commands. It can be ignored by most programs that read DXF files and need not be set by programs that write DXF files)</td></tr><tr><td>10</td><td>Origin (in WCS)
DXF: X value; APP: 3D point</td></tr><tr><td>20, 30</td><td>DXF: Y and Z values of origin (in WCS)</td></tr><tr><td>11</td><td>X-axis direction (in WCS)
DXF: X value; APP: 3D vector</td></tr><tr><td>21, 31</td><td>DXF: Y and Z values of X-axis direction (in WCS)</td></tr><tr><td>12</td><td>Y-axis direction (in WCS)
DXF: X value; APP: 3D vector</td></tr><tr><td>22, 32</td><td>DXF: Y and Z values of Y-axis direction (in WCS)</td></tr><tr><td>79</td><td>Always 0</td></tr><tr><td>146</td><td>Elevation</td></tr><tr><td>346</td><td>ID/handle of base UCS if this is an orthographic. This code is not present if the 79 code is 0. If this code is not present and 79 code is non-zero, then base UCS is assumed to be WORLD</td></tr><tr><td>71</td><td>Orthographic type (optional; always appears in pairs with the 13, 23, 33 codes):
1 = Top; 2 = Bottom
3 = Front; 4 = Back
5 = Left; 6 = Right</td></tr><tr><td>13</td><td>Origin for this orthographic type relative to this UCS
DXF: X value of origin point; APP: 3D point</td></tr><tr><td>23, 33</td><td>DXF: Y and Z values of origin point</td></tr></table>

Each 71/13,23,33 pair defines the UCS origin for a particular orthographic type relative to this UCS. For example, if the following pair is present, then

invoking the UCS/LEFT command when UCSBASE is set to this UCS will cause the new UCS origin to become (1,2,3).

71:5

13:1.0

23:2.0

33:3.0

If this pair were not present, then invoking the UCS/LEFT command would cause the new UCS origin to be set to this UCS's origin point.

# VIEW

The following group codes apply to VIEW symbol table entries. In addition to the group codes described here, see Common Group Codes for Symbol Table Entries on page 37. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

VIEW group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbViewTableRecord)</td></tr><tr><td>2</td><td>Name of view</td></tr><tr><td>70</td><td>Standard flag values (bit-coded values):
1 = If set, this is a paper space view
16 = If set, table entry is externally dependent on an xref
32 = If both this bit and bit 16 are set, the externally dependent xref has been successfully re-solved
64 = If set, the table entry was referenced by at least one entity in the drawing the last time the drawing was edited. (This flag is for the benefit of AutoCAD commands. It can be ignored by most programs that read DXF files and does not need to be set by programs that write DXF files)</td></tr><tr><td>40</td><td>View height (in DCS)</td></tr><tr><td>10</td><td>View center point (in DCS)
DXF: X value; APP: 2D point</td></tr><tr><td>20</td><td>DXF: Y value of view center point (in DCS)</td></tr><tr><td>41</td><td>View width (in DCS)</td></tr><tr><td colspan="2">VIEW group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>11</td><td>View direction from target (in WCS)
DXF: X value; APP: 3D vector</td></tr><tr><td>21, 31</td><td>DXF: Y and Z values of view direction from target (in WCS)</td></tr><tr><td>12</td><td>Target point (in WCS)
DXF: X value; APP: 3D point</td></tr><tr><td>22, 32</td><td>DXF: Y and Z values of target point (in WCS)</td></tr><tr><td>42</td><td>Lens length</td></tr><tr><td>43</td><td>Front clipping plane (offset from target point)</td></tr><tr><td>44</td><td>Back clipping plane (offset from target point)</td></tr><tr><td>50</td><td>Twist angle</td></tr><tr><td>71</td><td>View mode (see VIEWMODE system variable)</td></tr><tr><td>281</td><td>Render mode:
0 = 2D Optimized (classic 2D)
1 = Wireframe
2 = Hidden line
3 = Flat shaded
4 = Gouraud shaded
5 = Flat shaded with wireframe
6 = Gouraud shaded with wireframe
All rendering modes other than 2D Optimized engage the new 3D graphics pipeline. These values directly correspond to the SHADEMODE command and the AcDbAbstractViewTableRe-cord::RenderMode enum</td></tr><tr><td>72</td><td>1 if there is a UCS associated to this view; 0 otherwise</td></tr><tr><td>73</td><td>1 if the camera is plottable</td></tr><tr><td>332</td><td>Soft-pointer ID/handle to background object (optional)</td></tr><tr><td>334</td><td>Soft-pointer ID/handle to live section object (optional)</td></tr></table>

# VIEW group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>348</td><td>Hard-pointer ID/handle to visual style object (optional)</td></tr><tr><td>361</td><td>Sun hard ownership ID</td></tr><tr><td></td><td>The following codes appear only if code 72 is set to 1. They define the UCS that is associated to this view. This UCS will become the current UCS whenever this view is restored (if code 72 is 0, the UCS is unchanged).</td></tr><tr><td colspan="2">VIEW with UCS group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>110</td><td>UCS origin (appears only if code 72 is set to 1)
DXF: X value; APP: 3D point</td></tr><tr><td>120, 130</td><td>DXF: Y and Z values of UCS origin</td></tr><tr><td>111</td><td>UCS X-axis (appears only if code 72 is set to 1)
DXF: X value; APP: 3D vector</td></tr><tr><td>121, 131</td><td>DXF: Y and Z values of UCS X-axis</td></tr><tr><td>112</td><td>UCS Y-axis (appears only if code 72 is set to 1)
DXF: X value; APP: 3D vector</td></tr><tr><td>122, 132</td><td>DXF: Y and Z values of UCS Y-axis</td></tr><tr><td>79</td><td>Orthographic type of UCS (appears only if code 72 is set to 1):
0 = UCS is not orthographic
1 = Top; 2 = Bottom
3 = Front; 4 = Back
5 = Left; 6 = Right</td></tr><tr><td>146</td><td>UCS elevation (appears only if code 72 is set to 1)</td></tr><tr><td>345</td><td>ID/handle of AcDbUCSTableRecord if UCS is a named UCS. If not present, then UCS is unnamed (appears only if code 72 is set to 1)</td></tr><tr><td>346</td><td>ID/handle of AcDbUCSTableRecord of base UCS if UCS is orthographic (79 code is non-zero). If not present and 79 code is non-zero, then base UCS is taken to be WORLD (appears only if code 72 is set to 1)</td></tr></table>

# VPORT

The following group codes apply to VPORT symbol table entries. The VPORT table is unique: it may contain several entries with the same name (indicating a multiple-viewport configuration). The entries corresponding to the active viewpoint configuration all have the name *ACTIVE. The first such entry describes the current viewpoint. In addition to the group codes described here, see Common Group Codes for Symbol Table Entries on page 37. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

VPORT group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbViewportTableRecord)</td></tr><tr><td>2</td><td>Viewport name</td></tr><tr><td>70</td><td>Standard flag values (bit-coded values):
16 = If set, table entry is externally dependent on an xref
32 = If both this bit and bit 16 are set, the externally dependent xref has been successfully re-solved
64 = If set, the table entry was referenced by at least one entity in the drawing the last time the drawing was edited. (This flag is for the benefit of AutoCAD commands. It can be ignored by most programs that read DXF files and does not need to be set by programs that write DXF files)</td></tr><tr><td>10</td><td>Lower-left corner of viewport
DXF: X value; APP: 2D point</td></tr><tr><td>20</td><td>DXF: Y value of lower-left corner ofviewport</td></tr><tr><td>11</td><td>Upper-right corner of viewport
DXF: X value; APP: 2D point</td></tr><tr><td>21</td><td>DXF: Y value of upper-right corner ofviewport</td></tr><tr><td>12</td><td>View center point (in DCS)
DXF: X value; APP: 2D point</td></tr><tr><td>22</td><td>DXF: Y value of view center point (in DCS)</td></tr><tr><td>13</td><td>Snap base point (in DCS)</td></tr></table>

# VPORT group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td></td><td>DXF: X value; APP: 2D point</td></tr><tr><td>23</td><td>DXF: Y value of snap base point (in DCS)</td></tr><tr><td>14</td><td>Snap spacing X and Y
DXF: X value; APP: 2D point</td></tr><tr><td>24</td><td>DXF: Y value of snap spacing X and Y</td></tr><tr><td>15</td><td>Grid spacing X and Y
DXF: X value; APP: 2D point</td></tr><tr><td>25</td><td>DXF: Y value of grid spacing X and Y</td></tr><tr><td>16</td><td>View direction from target point (in WCS)
DXF: X value; APP: 3D point</td></tr><tr><td>26, 36</td><td>DXF: Y and Z values of view direction from target point (in WCS)</td></tr><tr><td>17</td><td>View target point (in WCS)
DXF: X value; APP: 3D point</td></tr><tr><td>27, 37</td><td>DXF: Y and Z values of view target point (in WCS)</td></tr><tr><td>42</td><td>Lens length</td></tr><tr><td>43</td><td>Front clipping plane (offset from target point)</td></tr><tr><td>44</td><td>Back clipping plane (offset from target point)</td></tr><tr><td>45</td><td>View height</td></tr><tr><td>50</td><td>Snap rotation angle</td></tr><tr><td>51</td><td>View twist angle</td></tr><tr><td>72</td><td>Circle sides</td></tr><tr><td>331 or 441</td><td>Soft or hard-pointer ID/handle to frozen layer objects; repeats for each frozen layers</td></tr><tr><td colspan="2">VPORT group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>70</td><td>Bit flags and perspective mode</td></tr><tr><td>1</td><td>Plot style sheet</td></tr><tr><td>281</td><td>Render mode:
0 = 2D Optimized (classic 2D)
1 = Wireframe
2 = Hidden line
3 = Flat shaded
4 = Gouraud shaded
5 = Flat shaded with wireframe
6 = Gouraud shaded with wireframe
All rendering modes other than 2D Optimized engage the new 3D graphics pipeline. These values directly correspond to the SHADEMODE command and the AcDbAbstractViewTableRe-record::RenderMode enum</td></tr><tr><td>71</td><td>View mode (see VIEWMODE system variable)</td></tr><tr><td>74</td><td>UCSICON setting</td></tr><tr><td>110</td><td>UCS origin
DXF: X value; APP: 3D point</td></tr><tr><td>120, 130</td><td>DXF: Y and Z values of UCS origin</td></tr><tr><td>111</td><td>UCS X-axis
DXF: X value; APP: 3D vector</td></tr><tr><td>121, 131</td><td>DXF: Y and Z values of UCS X-axis</td></tr><tr><td>112</td><td>UCS Y-axis
DXF: X value; APP: 3D vector</td></tr><tr><td>122, 132</td><td>DXF: Y and Z values of UCS Y-axis</td></tr><tr><td>345</td><td>ID/handle of AcDbUCSTableRecord if UCS is a named UCS. If not present, then UCS is unnamed</td></tr><tr><td>346</td><td>ID/handle of AcDbUCSTableRecord of base UCS if UCS is orthographic (79 code is non-zero). If not present and 79 code is non-zero, then base UCS is taken to be WORLD</td></tr></table>

# VPORT group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>79</td><td>Orthographic type of UCS
0 = UCS is not orthographic
1 = Top; 2 = Bottom
3 = Front; 4 = Back
5 = Left; 6 = Right</td></tr><tr><td>146</td><td>Elevation</td></tr><tr><td>170</td><td>Shade plot setting</td></tr><tr><td>61</td><td>Major grid lines</td></tr><tr><td>332</td><td>Soft-pointer ID/handle to background object (optional)</td></tr><tr><td>333</td><td>Soft-pointer ID/handle to shade plot object (optional)</td></tr><tr><td>348</td><td>Hard-pointer ID/handle to visual style object (optional)</td></tr><tr><td>292</td><td>Default Lighting On flag</td></tr><tr><td>282</td><td>Default Lighting type
0 = One distant light
1 = Two distant lights</td></tr><tr><td>141</td><td>Brightness</td></tr><tr><td>142</td><td>Contrast</td></tr><tr><td>63, 421, 431</td><td>Ambient color (only output when non-black)</td></tr></table>

# BLOCKS Section

# 5

The group codes described in this chapter are found in  $\mathrm{DXF}^{\mathrm{TM}}$  files and used by applications. The BLOCKS section contains an entry for each block reference in the drawing.

# BLOCKS Section Group Codes

The BLOCKS section of the DXF file contains all the block definitions, including anonymous blocks generated by the HATCH command and by associative dimensioning. Each block definition contains the entities that make up that block as it is used in the drawing. The format of the entities in this section is identical to those in the ENTITIES section. All entities in the BLOCKS section appear between block and endblk entities. Block and endblk entities appear only in the BLOCKS section. Block definitions are never nested (that is, no block or endblk entity ever appears within another block-endblk pair), although a block definition can contain an insert entity.

External references are written in the DXF file as block definitions, except that they also include a string (group code 1) that specifies the path and file name of the external reference.

The block table handle, along with any xdata and persistent reactors, appears in each block definition immediately following the BLOCK record, which contains all of the specific information that a block table record stores.

# BLOCK

The following group codes apply to block entities. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

# Block group codes

# Group code Description

0 Entity type (BLOCK)
5 Handle
102 Start of application-defined group " $application_name"$ . For example, " $ACAD_REACTORS"$  indicates the start of the AutoCAD persistent reactors group (optional)
application- Codes and values within the 102 groups are application defined (optional) defined codes
102 End of group,  $"\}$  (optional)
330 Soft-pointer ID/handle to owner object
100 Subclass marker (AcDbEntity)
8 Layer name
100 Subclass marker (AcDbBlockBegin)
2 Block name
70 Block-type flags (bit-coded values, may be combined):

$0 =$  Indicates none of the following flags apply
$1 =$  This is an anonymous block generated by hatching, associative dimensioning, other internal operations, or an application
$2 =$  This block has non-constant attribute definitions (this bit is not set if the block has any attribute definitions that are constant, or has no attribute definitions at all)
$4 =$  This block is an external reference (xref)
$8 =$  This block is an xref overlay
$16 =$  This block is externally dependent
32 = This is a resolved external reference, or dependent of an external reference (ignored on input)
${64} =$  This definition is a referenced external reference (ignored
on input)

# Block group codes

# Group code Description

10 Base point

DXF: X value; APP: 3D point

20, 30 DXF:  $Y$  and  $Z$  values of base point

3 Block name

1 Xref path name

4 Block description (optional)

The UCS in effect when a block definition is created becomes the WCS for all entities in the block definition. The new origin for these entities is shifted to match the base point defined for the block definition. All entity data is translated to fit this new WCS.

# Model Space and Paper Space Block Definitions

Three empty definitions always appear in the BLOCKS section. They are titled *Model_Space,*Paper_Space and *Paper_Space0. These definitions manifest the representations of model space and paper space as block definitions internally. The internal name of the first paper space layout is*Paper_Space, the second is *Paper_Space0, the third is*Paper_Space1, and so on.

# Model Space and Paper Space Entity Segregation

The interleaving between model space and paper space no longer occurs. Instead, all paper space entities are output, followed by model space entities. The flag distinguishing them is the group code 67.

# ENDBLK

The following group codes apply to endblk objects. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

# Endblk group codes

# Group code Description

0 Entity type (ENDBLK)

# Endblk group codes

# Group code Description

5 Handle
102 Start of application-defined group " $application_name"$ . For example, " $ACAD_REACTORS"$  indicates the start of the AutoCAD persistent reactors group (optional)
application- Codes and values within the 102 groups are application defined (optional) defined codes
102 End of group,  $"\}$  (optional)
330 Soft-pointer ID/handle to owner object
100 Subclass marker (AcDbEntity)
8 Layer name
100 Subclass marker (AcDbBlockEnd)

# ENTITIES Section

This chapter presents the group codes that apply to graphical objects. These codes are found in the ENTITIES section of a  $\mathrm{DXF}^{\mathrm{TM}}$  file and are used by AutoLISP® and ObjectARX® applications in entity definition lists.

# Common Group Codes for Entities

The following table shows group codes that apply to virtually all graphical objects. Some of the group codes shown here are included with an entity definition only if the entity has nondefault values for the property. When you refer to the group codes by entity type, the lists of codes associated with specific entities, keep in mind that the codes shown here are also present.

NOTE Do not write programs that rely on the order shown in these DXF code tables. Although these tables show the order of group codes as they usually appear, the order can change under certain conditions or may be changed in a future AutoCAD® release. The code that controls an entity should be driven by a case (switch) or a table so that it can process each group correctly even if the order is unexpected.

When a group is omitted, its default value upon input (when using OPEN) is indicated in the third column. If the value of a group code is equal to the default, it is omitted upon output (when using SAVEAS). For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

Group codes that apply to all graphical objects

<table><tr><td>Group code</td><td>Description</td><td>If omitted, defaults to...</td></tr><tr><td>-1</td><td>APP: entity name (changes each time a drawing is opened)</td><td>not omitted</td></tr><tr><td colspan="3">Group codes that apply to all graphical objects</td></tr><tr><td>Group code</td><td>Description</td><td>If omitted, defaults to...</td></tr><tr><td>0</td><td>Entity type</td><td>not omitted</td></tr><tr><td>5</td><td>Handle</td><td>not omitted</td></tr><tr><td>102</td><td>Start of application-defined group
“{application_name” (optional)</td><td>no default</td></tr><tr><td>application-
defined codes</td><td>Codes and values within the 102 groups are application-defined (optional)</td><td>no default</td></tr><tr><td>102</td><td>End of group, “}” (optional)</td><td>no default</td></tr><tr><td>102</td><td>“{ACAD_REACTORS” indicates the start of the AutoCAD persistent reactors group. This group exists only if persistent reactors have been attached to this object (optional)</td><td>no default</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary (optional)</td><td>no default</td></tr><tr><td>102</td><td>End of group, “}” (optional)</td><td>no default</td></tr><tr><td>102</td><td>“{ACAD_XDICTIONARY” indicates the start of an extension dictionary group. This group exists only if an extension dictionary has been attached to the object (optional)</td><td>no default</td></tr><tr><td>360</td><td>Hard-owner ID/handle to owner dictionary (optional)</td><td>no default</td></tr><tr><td>102</td><td>End of group, “}” (optional)</td><td>no default</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner BLOCK RECORD object</td><td>not omitted</td></tr><tr><td>100</td><td>Subclass marker (AcDbEntity)</td><td>not omitted</td></tr><tr><td>67</td><td>Absent or zero indicates entity is in model space. 1 indicates entity is in paper space (optional).</td><td>0</td></tr><tr><td>410</td><td>APP: layout tab name</td><td>not omitted</td></tr><tr><td>8</td><td>Layer name</td><td>not omitted</td></tr></table>

Group codes that apply to all graphical objects

<table><tr><td>Group code</td><td>Description</td><td>If omitted, defaults to...</td></tr><tr><td>6</td><td>Linetype name (present if not BYLAYER). The special name BYBLOCK indicates a floating linetype (optional)</td><td>BYLAYER</td></tr><tr><td>347</td><td>Hard-pointer ID/handle to material object (present if not BYLAYER)</td><td>BYLAYER</td></tr><tr><td>62</td><td>Color number (present if not BYLAYER); zero indicates the BYBLOCK (floating) color; 256 indicates BYLAYER; a negative value indicates that the layer is turned off (optional)</td><td>BYLAYER</td></tr><tr><td>370</td><td>Lineweight enum value. Stored and moved around as a 16-bit integer.</td><td>not omitted</td></tr><tr><td>48</td><td>Linetype scale (optional)</td><td>1.0</td></tr><tr><td>60</td><td>Object visibility (optional): 0 = Visible; 1 = Invisible</td><td>0</td></tr><tr><td>92</td><td>Number of bytes in the proxy entity graphics represented in the subsequent 310 groups, which are binary chunk records (optional)</td><td>no default</td></tr><tr><td>310</td><td>Proxy entity graphics data (multiple lines; 256 characters max. per line) (optional)</td><td>no default</td></tr><tr><td>420</td><td>A 24-bit color value that should be dealt with in terms of bytes with values of 0 to 255. The lowest byte is the blue value, the middle byte is the green value, and the third byte is the red value. The top byte is always 0. The group code cannot be used by custom entities for their own data because the group code is reserved for AcDbEntity, class-level color data and AcDbEntity, class-level transparency data</td><td>no default</td></tr><tr><td>430</td><td>Color name. The group code cannot be used by custom entities for their own data because the group code is reserved for AcDbEntity, class-level color data and AcDbEntity, class-level transparency data</td><td>no default</td></tr><tr><td>440</td><td>Transparency value. The group code cannot be used by custom entities for their own data because the group code is reserved for AcDbEntity, class-level color data and AcDbEntity, class-level transparency data</td><td>no default</td></tr><tr><td>390</td><td>Hard-pointer ID/handle to the plot style object</td><td>no default</td></tr><tr><td>284</td><td>Shadow mode</td><td>no default</td></tr></table>

Group codes that apply to all graphical objects

<table><tr><td>Group code</td><td>Description</td><td>If omitted, defaults to...</td></tr><tr><td></td><td>0 = Casts and receives shadows</td><td></td></tr><tr><td></td><td>1 = Casts shadows</td><td></td></tr><tr><td></td><td>2 = Receives shadows</td><td></td></tr><tr><td></td><td>3 = Ignores shadows</td><td></td></tr></table>

# 3DFACE

The following group codes apply to 3dface entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

3dface group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbFace)</td></tr><tr><td>10</td><td>First corner (in WCS)
DXF: X value; APP: 3D point</td></tr><tr><td>20, 30</td><td>DXF: Y and Z values of first corner (in WCS)</td></tr><tr><td>11</td><td>Second corner (in WCS)
DXF: X value; APP: 3D point</td></tr><tr><td>21, 31</td><td>DXF: Y and Z values of second corner (in WCS)</td></tr><tr><td>12</td><td>Third corner (in WCS)
DXF: X value; APP: 3D point</td></tr><tr><td>22, 32</td><td>DXF: Y and Z values of third corner (in WCS)</td></tr><tr><td>13</td><td>Fourth corner (in WCS). If only three corners are entered, this is the same as the third corner
DXF: X value; APP: 3D point</td></tr><tr><td>23, 33</td><td>DXF: Y and Z values of fourth corner (in WCS)</td></tr><tr><td>70</td><td>Invisible edge flags (optional; default = 0):</td></tr></table>

# 3dface group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td></td><td>1 = First edge is invisible</td></tr><tr><td></td><td>2 = Second edge is invisible</td></tr><tr><td></td><td>4 = Third edge is invisible</td></tr><tr><td></td><td>8 = Fourth edge is invisible</td></tr></table>

# 3DSOLID

The following group codes apply to 3dsolid entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

# 3dsolid group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbModelerGeometry)</td></tr><tr><td>70</td><td>Modeler format version number (currently = 1)</td></tr><tr><td>1</td><td>Proprietary data (multiple lines &lt; 255 characters each)</td></tr><tr><td>3</td><td>Additional lines of proprietary data (if previous group 1 string is greater than 255 characters) (optional)</td></tr><tr><td>100</td><td>Subclass marker (AcDb3dSolid)</td></tr><tr><td>350</td><td>Soft-owner ID/handle to history object</td></tr></table>

# ACAD_PROXYumbling

The following group codes apply to proxy entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For

information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">Acad-proxy-entity group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>DXF: AcDbProxyEntity</td></tr><tr><td>90</td><td>DXF: Proxy entity class ID (always 498)</td></tr><tr><td>91</td><td>DXF: Application entity&#x27;s class ID. Class IDs are based on the order of the class in the CLASSES section. The first class is given the ID of 500, the next is 501, and so on</td></tr><tr><td>92</td><td>DXF: Size of graphics data in bytes</td></tr><tr><td>310</td><td>DXF: Binary graphics data (multiple entries can appear) (optional)</td></tr><tr><td>93</td><td>DXF: Size of entity data in bits</td></tr><tr><td>310</td><td>DXF: Binary entity data (multiple entries can appear) (optional)</td></tr><tr><td>330 or 340 or 350 or 360</td><td>DXF: An object ID (multiple entries can appear) (optional)</td></tr><tr><td>94</td><td>DXF: 0 (indicates end of object ID section)</td></tr><tr><td>95</td><td>DXF: Object drawing format when it becomes a proxy (a 32-bit unsigned integer):
Low word is AcDbDwgVersion
High word is MaintenanceReleaseVersion</td></tr><tr><td>70</td><td>DXF: Original custom object data format:
0 = DWG format
1 = DXF format</td></tr></table>

# ARC

The following group codes apply to arc entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For

information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">Arc group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbCircle)</td></tr><tr><td>39</td><td>Thickness (optional; default = 0)</td></tr><tr><td>10</td><td>Center point (in OCS)
DXF: X value; APP: 3D point</td></tr><tr><td>20, 30</td><td>DXF: Y and Z values of center point (in OCS)</td></tr><tr><td>40</td><td>Radius</td></tr><tr><td>100</td><td>Subclass marker (AcDbArc)</td></tr><tr><td>50</td><td>Start angle</td></tr><tr><td>51</td><td>End angle</td></tr><tr><td>210</td><td>Extrusion direction (optional; default = 0, 0, 1)
DXF: X value; APP: 3D vector</td></tr><tr><td>220, 230</td><td>DXF: Y and Z values of extrusion direction (optional)</td></tr></table>

# ATTDEF

The following group codes apply to attdef (attribute definition) entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">Attdef group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbText)</td></tr><tr><td>39</td><td>Thickness (optional; default = 0)</td></tr><tr><td>10</td><td>First alignment point (in OCS)DXF: X value; APP: 3D point</td></tr><tr><td>20, 30</td><td>DXF: Y and Z values of text start point (in OCS)</td></tr><tr><td>40</td><td>Text height</td></tr><tr><td>1</td><td>Default value (string)</td></tr><tr><td>50</td><td>Text rotation (optional; default = 0)</td></tr><tr><td>41</td><td>Relative X scale factor (width) (optional; default = 1). This value is also adjusted when fit-type text is used</td></tr><tr><td>51</td><td>Oblique angle (optional; default = 0)</td></tr><tr><td>7</td><td>Text style name (optional; default = STANDARD)</td></tr><tr><td>71</td><td>Text generation flags (optional; default = 0); see TEXT on page 144 group codes</td></tr><tr><td>72</td><td>Horizontal text justification type (optional; default = 0); see TEXT on page 144 group codes</td></tr><tr><td>11</td><td>Second alignment point (in OCS) (optional)DXF: X value; APP: 3D pointMeaningful only if 72 or 74 group values are nonzero</td></tr><tr><td>21, 31</td><td>DXF: Y and Z values of second alignment point (in OCS) (optional)</td></tr><tr><td>210</td><td>Extrusion direction (optional; default = 0, 0, 1)DXF: X value; APP: 3D vector</td></tr><tr><td>220, 230</td><td>DXF: Y and Z values of extrusion direction</td></tr><tr><td>100</td><td>Subclass marker (AcDbAttributeDefinition)</td></tr><tr><td>280</td><td>Version number:0 = 2010</td></tr><tr><td>3</td><td>Prompt string</td></tr><tr><td>2</td><td>Tag string (cannot contain spaces)</td></tr><tr><td>70</td><td>Attribute flags:
1 = Attribute is invisible (does not appear)
2 = This is a constant attribute
4 = Verification is required on input of this attribute
8 = Attribute is preset (no prompt during insertion)</td></tr><tr><td>73</td><td>Field length (optional; default = 0) (not currently used)</td></tr><tr><td>74</td><td>Vertical text justification type (optional, default = 0); see group code 73 in TEXT on page 144</td></tr><tr><td>280</td><td>Lock position flag. Locks the position of the attribute within the block reference</td></tr><tr><td>100</td><td>Subclass marker (AcDbXrecord)</td></tr><tr><td>280</td><td>Duplicate record cloning flag (determines how to merge duplicate entries):
1 = Keep existing</td></tr><tr><td>70</td><td>MText flag:
2 = multiline attribute
4 = constant multiline attribute definition</td></tr><tr><td>70</td><td>isReallyLocked flag:
0 = unlocked
1 = locked</td></tr><tr><td>70</td><td>Number of secondary attributes or attribute definitions</td></tr><tr><td>340</td><td>hard-pointer id of secondary attribute(s) or attribute definition(s)</td></tr><tr><td>10</td><td>Alignment point of attribute or attribute definition
DXF: X value; APP: 3D point</td></tr><tr><td>20,30</td><td>DXF: Y and Z values of insertion point</td></tr><tr><td>40</td><td>current annotation scale</td></tr><tr><td>2</td><td>attribute or attribute definition tag string</td></tr><tr><td>0</td><td>Entity type (MTEXT)</td></tr><tr><td>100</td><td>Subclass marker (AcDbEntity)</td></tr><tr><td>67</td><td>Absent or zero indicates entity is in model space. 1 indicates entity is in paper space (optional)</td></tr><tr><td>8</td><td>Layer name</td></tr><tr><td>100</td><td>Subclass marker (AcDbMText)</td></tr><tr><td>10</td><td>Insertion point
DXF: X value; APP: 3D point</td></tr><tr><td>20,30</td><td>DXF: Y and Z values of insertion point</td></tr><tr><td>40</td><td>Nominal (initial) text height</td></tr><tr><td>41</td><td>Reference rectangle width</td></tr><tr><td>46</td><td>Defined annotation height</td></tr><tr><td>71</td><td>Attachment point:
1 = Top left; 2 = Top center; 3 = Top right
4 = Middle left; 5 = Middle center; 6 = Middle right
7 = Bottom left; 8 = Bottom center; 9 = Bottom right</td></tr><tr><td>72</td><td>Drawing direction:
1 = Left to right
3 = Top to bottom
5 = By style (the flow direction is inherited from the associated text style)</td></tr><tr><td>1</td><td>Text string
If the text string is less than 250 characters, all characters appear in group 1. If the text string is greater than 250 characters, the string is divided into 250-character chunks, which appear in one or more group 3 codes. If group 3 codes are used, the last group is a group 1 and has fewer than 250 characters.</td></tr><tr><td>3</td><td>Additional text (always in 250-character chunks) (optional)</td></tr><tr><td>7</td><td>DXF: X value; APP: 3D vectText style name (STANDARD if not provided) (optional)</td></tr><tr><td>210</td><td>Extrusion direction (optional; default = 0, 0, 1)DXF: X value; APP: 3D vector</td></tr><tr><td>220,230</td><td>DXF: Y and Z values of extrusion direction (optional)</td></tr><tr><td>11</td><td>X-axis direction vector (in WCS)DXF: X value; APP: 3D vector</td></tr><tr><td>21,31</td><td>DXF: Y and Z values of X-axis direction vector (in WCS)</td></tr><tr><td>42</td><td>Horizontal width of the characters that make up the mtext entity.This value will always be equal to or less than the value of group code 41 (read-only, ignored if supplied).</td></tr><tr><td>43</td><td>Vertical height of the mtext entity (read-only, ignored if supplied)</td></tr><tr><td>50</td><td>Rotation angle in radians</td></tr><tr><td>73</td><td>Mtext line spacing style (optional):1 = At least (taller characters will override)2 = Exact (taller characters will not override)</td></tr><tr><td>44</td><td>Mtext line spacing factor (optional):Percentage of default (3-on-5) line spacing to be applied Valid values range from 0.25 to 4.00</td></tr><tr><td>90</td><td>Background fill setting:0 = Background fill off1 = Use background fill color2 = Use drawing window color as background fill color</td></tr><tr><td>63</td><td>Background color (if color index number)</td></tr><tr><td>420-429</td><td>Background color (if RGB color)</td></tr><tr><td>430-439</td><td>Background color (if color name)</td></tr><tr><td>45</td><td>Fill box scale (optional):Determines how much border is around the text.</td></tr><tr><td>63</td><td>Background fill color (optional):
Color to use for background fill when group code 90 is 1.</td></tr><tr><td>441</td><td>Transparency of background fill color (not implemented)</td></tr><tr><td></td><td>If group 72 and/or 74 values are nonzero then the first alignment point values are ignored and new values are calculated by AutoCAD, based on the second alignment point and the length and height of the text string itself (after applying the text style). If the 72 and 74 values are zero or missing, then the second alignment point is meaningless.</td></tr><tr><td>ATTRIB</td><td>The following group codes apply to attrib (attribute) entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.</td></tr><tr><td colspan="2">Attrib group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbText)</td></tr><tr><td>39</td><td>Thickness (optional; default = 0)</td></tr><tr><td>10</td><td>Text start point (in OCS)
DXF: X value; APP: 3D point</td></tr><tr><td>20, 30</td><td>DXF: Y and Z values of text start point (in OCS)</td></tr><tr><td>40</td><td>Text height</td></tr><tr><td>1</td><td>Default value (string)</td></tr><tr><td>100</td><td>Subclass marker (AcDbAttribute)</td></tr><tr><td>280</td><td>Version number:
0 = 2010</td></tr><tr><td colspan="2">Attrib group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>2</td><td>Attribute tag (string; cannot contain spaces)</td></tr><tr><td>70</td><td>Attribute flags:
1 = Attribute is invisible (does not appear)
2 = This is a constant attribute
4 = Verification is required on input of this attribute
8 = Attribute is preset (no prompt during insertion)</td></tr><tr><td>73</td><td>Field length (optional; default = 0) (not currently used)</td></tr><tr><td>50</td><td>Text rotation (optional; default = 0)</td></tr><tr><td>41</td><td>Relative X scale factor (width) (optional; default = 1). This value is also adjusted when fit-type text is used</td></tr><tr><td>51</td><td>Oblique angle (optional; default = 0)</td></tr><tr><td>7</td><td>Text style name (optional; default = STANDARD)</td></tr><tr><td>71</td><td>Text generation flags (optional; default = 0). See TEXT on page 144 group codes</td></tr><tr><td>72</td><td>Horizontal text justification type (optional; default = 0). See TEXT on page 144 group codes</td></tr><tr><td>74</td><td>Vertical text justification type (optional; default = 0). See group code 73 in TEXT on page 144</td></tr><tr><td>11</td><td>Alignment point (in OCS) (optional)
DXF: X value; APP: 3D point
Present only if 72 or 74 group is present and nonzero</td></tr><tr><td>21, 31</td><td>DXF: Y and Z values of alignment point (in OCS) (optional)</td></tr><tr><td>210</td><td>Extrusion direction. Present only if the entity's extrusion direction is not parallel to the WCS Z axis (optional; default = 0, 0, 1)
DXF: X value; APP: 3D vector</td></tr><tr><td>220, 230</td><td>DXF: Y and Z values of extrusion direction (optional)</td></tr><tr><td>280</td><td>Lock position flag. Locks the position of the attribute within the block reference</td></tr><tr><td>100</td><td>Subclass marker (AcDbXrecord)</td></tr><tr><td>280</td><td>Duplicate record cloning flag (determines how to merge duplicate entries):
1 = Keep existing</td></tr><tr><td>70</td><td>MText flag:
2 = multiline attribute
4 = constant multiline attribute definition</td></tr><tr><td>70</td><td>isReallyLocked flag:
0 = unlocked
1 = locked</td></tr><tr><td>70</td><td>Number of secondary attributes or attribute definitions</td></tr><tr><td>340</td><td>Hard-pointer id of secondary attribute(s) or attribute definition(s)</td></tr><tr><td>10</td><td>Alignment point of attribute or attribute definition
DXF: X value; APP: 3D point</td></tr><tr><td>20,30</td><td>DXF: Y and Z values of insertion point</td></tr><tr><td>40</td><td>current annotation scale</td></tr><tr><td>2</td><td>attribute or attribute definition tag string</td></tr><tr><td>0</td><td>Entity type (MTEXT)</td></tr><tr><td>100</td><td>Subclass marker (AcDbEntity)</td></tr><tr><td>67</td><td>Absent or zero indicates entity is in model space. 1 indicates entity is in paper space (optional)</td></tr><tr><td>8</td><td>Layer name</td></tr><tr><td>100</td><td>Subclass marker (AcDbMText)</td></tr><tr><td>10</td><td>Insertion point
DXF: X value; APP: 3D point</td></tr><tr><td>20,30</td><td>DXF: Y and Z values of insertion point</td></tr><tr><td>40</td><td>Nominal (initial) text height</td></tr><tr><td>41</td><td>Reference rectangle width</td></tr><tr><td>46</td><td>Defined annotation height</td></tr><tr><td>71</td><td>Attachment point:
1 = Top left; 2 = Top center; 3 = Top right
4 = Middle left; 5 = Middle center; 6 = Middle right
7 = Bottom left; 8 = Bottom center; 9 = Bottom right</td></tr><tr><td>72</td><td>Drawing direction:
1 = Left to right
3 = Top to bottom
5 = By style (the flow direction is inherited from the associated text style)</td></tr><tr><td>1</td><td>Text string
If the text string is less than 250 characters, all characters appear in group 1. If the text string is greater than 250 characters, the string is divided into 250-character chunks, which appear in one or more group 3 codes. If group 3 codes are used, the last group is a group 1 and has fewer than 250 characters.</td></tr><tr><td>3</td><td>Additional text (always in 250-character chunks) (optional)</td></tr><tr><td>7</td><td>DXF: X value; APP: 3D vectText style name (STANDARD if not provided) (optional)</td></tr><tr><td>210</td><td>Extrusion direction (optional; default = 0, 0, 1)
DXF: X value; APP: 3D vector</td></tr><tr><td>220,230</td><td>DXF: Y and Z values of extrusion direction (optional)</td></tr><tr><td>11</td><td>X-axis direction vector (in WCS)
DXF: X value; APP: 3D vector</td></tr><tr><td>21,31</td><td>DXF: Y and Z values of X-axis direction vector (in WCS)</td></tr><tr><td>42</td><td>Horizontal width of the characters that make up the mtext entity.
This value will always be equal to or less than the value of group code 41 (read-only, ignored if supplied).</td></tr><tr><td>43</td><td>Vertical height of the mtext entity (read-only, ignored if supplied)</td></tr><tr><td>50</td><td>Rotation angle in radians</td></tr><tr><td>73</td><td>Mtext line spacing style (optional):
1 = At least (taller characters will override)
2 = Exact (taller characters will not override)</td></tr><tr><td>44</td><td>Mtext line spacing factor (optional):
Percentage of default (3-on-5) line spacing to be applied.
Valid values range from 0.25 to 4.00</td></tr><tr><td>90</td><td>Background fill setting:
0 = Background fill off
1 = Use background fill color
2 = Use drawing window color as background fill color</td></tr><tr><td>63</td><td>Background color (if color index number)</td></tr><tr><td>420-429</td><td>Background color (if RGB color)</td></tr><tr><td>430-439</td><td>Background color (if color name)</td></tr><tr><td>45</td><td>Fill box scale (optional):
Determines how much border is around the text.</td></tr><tr><td>63</td><td>Background fill color (optional):
Color to use for background fill when group code 90 is 1.</td></tr><tr><td>441</td><td>Transparency of background fill color (not implemented)</td></tr></table>

If group 72 and/or 74 values are nonzero then the text insertion point values are ignored, and new values are calculated by AutoCAD based on the text alignment point and the length of the text string itself (after applying the text style). If the 72 and 74 values are zero or missing, then the text alignment point is ignored and recalculated based on the text insertion point and the length of the text string itself (after applying the text style).

# BODY

The following group codes apply to body entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">Body group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbModelerGeometry)</td></tr><tr><td>70</td><td>Modeler format version number (currently = 1)</td></tr><tr><td>1</td><td>Proprietary data (multiple lines &lt; 255 characters each)</td></tr><tr><td>3</td><td>Additional lines of proprietary data (if previous group 1 string is greater than 255 characters) (optional)</td></tr></table>

# CIRCLE

The following group codes apply to circle entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">Circle group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbCircle)</td></tr><tr><td>39</td><td>Thickness (optional; default = 0)</td></tr><tr><td>10</td><td>Center point (in OCS)
DXF: X value; APP: 3D point</td></tr><tr><td>20, 30</td><td>DXF: Y and Z values of center point (in OCS)</td></tr><tr><td>40</td><td>Radius</td></tr><tr><td>210</td><td>Extrusion direction (optional; default = 0, 0, 1)
DXF: X value; APP: 3D vector</td></tr></table>

Circle group codes

Group code Description

220, 230 DXF:  $Y$  and  $Z$  values of extrusion direction (optional)

# DIMENSION

Dimension entity definitions consist of group codes that are common to all dimension types, followed by codes specific to the type.

# Common Dimension Group Codes

The following group codes apply to all dimension entity types. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">Common dimension group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbDimension)</td></tr><tr><td>280</td><td>Version number:
0 = 2010</td></tr><tr><td>2</td><td>Name of the block that contains the entities that make up the dimension picture</td></tr><tr><td>10</td><td>Definition point (in WCS)
DXF: X value; APP: 3D point</td></tr><tr><td>20, 30</td><td>DXF: Y and Z values of definition point (in WCS)</td></tr><tr><td>11</td><td>Middle point of dimension text (in OCS)
DXF: X value; APP: 3D point</td></tr><tr><td>21, 31</td><td>DXF: Y and Z values of middle point of dimension text (in OCS)</td></tr><tr><td>70</td><td>Dimension type:
Values 0-6 are integer values that represent the dimension type. Values 32, 64, and 128 are bit values, which are added to the integer values (value 32 is always set in R13 and later releases)</td></tr></table>

# Common dimension group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td></td><td>0 = Rotated, horizontal, or vertical; 1 = Aligned2 = Angular; 3 = Diameter; 4 = Radius5 = Angular 3 point; 6 = Ordinate32 = Indicates that the block reference (group code 2) is referenced by this dimension only64 = Ordinate type. This is a bit value (bit 7) used only with integer value 6. If set, ordinate is X-type; if not set, ordinate is Y-type128 = This is a bit value (bit 8) added to the other group 70 values if the dimension text has been positioned at a user-defined location rather than at the default location</td></tr><tr><td>71</td><td>Attachment point:1 = Top left; 2 = Top center; 3 = Top right4 = Middle left; 5 = Middle center; 6 = Middle right7 = Bottom left; 8 = Bottom center; 9 = Bottom right</td></tr><tr><td>72</td><td>Dimension text line-spacing style (optional):1 (or missing) = At least (taller characters will override)2 = Exact (taller characters will not override)</td></tr><tr><td>41</td><td>Dimension text-line spacing factor (optional):Percentage of default (3-on-5) line spacing to be applied. Valid values range from 0.25 to 4.00</td></tr><tr><td>42</td><td>Actual measurement (optional; read-only value)</td></tr><tr><td>1</td><td>Dimension text explicitly entered by the user. Optional; default is the measurement. If null or “&lt;&gt;”, the dimension measurement is drawn as the text, if “” (one blank space), the text is suppressed. Anything else is drawn as the text</td></tr><tr><td>53</td><td>The optional group code 53 is the rotation angle of the dimension text away from its default orientation (the direction of the dimension line) (optional)</td></tr><tr><td>51</td><td>All dimension types have an optional 51 group code, which indicates the horizontal direc-tion for the dimension entity. The dimension entity determines the orientation of dimension text and lines for horizontal, vertical, and rotated linear dimensionsThis group value is the negative of the angle between the OCS X axis and the UCS X axis.It is always in the XY plane of the OCS</td></tr><tr><td>210</td><td>Extrusion direction (optional; default = 0, 0, 1)DXF: X value; APP: 3D vector</td></tr><tr><td colspan="2">Common dimension group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>220, 230</td><td>DXF: Y and Z values of extrusion direction (optional)</td></tr><tr><td>3</td><td>Dimension style name</td></tr><tr><td></td><td>Xdata belonging to the application ID "ACAD" follows a dimension entity if any dimension overrides have been applied to this entity. See Dimension Style Overrides on page 86.For all dimension types, the following group codes represent 3D WCS points:■ (10, 20, 30)■ (13, 23, 33)■ (14, 24, 34)■ (15, 25, 35)For all dimension types, the following group codes represent 3D OCS points:■ (11, 21, 31)■ (12, 22, 32)■ (16, 26, 36)</td></tr></table>

# Aligned Dimension Group Codes

The following group codes apply to aligned dimensions. In addition to the group codes described here, those listed in Common Group Codes for Entities on page 61 and Common Dimension Group Codes on page 78 can also be present. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">Aligned dimension group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbAlignedDimension)</td></tr><tr><td>12</td><td>Insertion point for clones of a dimension—Baseline and Continue (in OCS)DXF: X value; APP: 3D point</td></tr><tr><td>22, 32</td><td>DXF: Y and Z values of insertion point for clones of a dimension—Baseline and Continue (in OCS)</td></tr><tr><td>13</td><td>Definition point for linear and angular dimensions (in WCS)
DXF: X value; APP: 3D point</td></tr><tr><td>23, 33</td><td>DXF: Y and Z values of definition point for linear and angular dimensions (in WCS)</td></tr><tr><td>14</td><td>Definition point for linear and angular dimensions (in WCS)
DXF: X value; APP: 3D point</td></tr><tr><td>24, 34</td><td>DXF: Y and Z values of definition point for linear and angular dimensions (in WCS)</td></tr></table>

The point (13,23,33) specifies the start point of the first extension line and the point (14,24,34) specifies the start point of the second extension line. Point (10,20,30) specifies the dimension line location. The point (11,21,31) specifies the midpoint of the dimension text.

![](images/debdc8cdb792f39a6585e01796f7629ad9497a2aea5b5c82f1409ba2a9be2013.jpg)
(13,23,33)

# Linear and Rotated Dimension Group Codes

The following group codes apply to linear and rotated dimensions (note that linear and rotated dimensions are part of the AcDbAlignedDimension subclass). In addition to the group codes described here, those listed in Common Group Codes for Entities on page 61 and Common Dimension Group Codes on page 78 can also be present. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">Linear and rotated dimension group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbAlignedDimension)</td></tr><tr><td>12</td><td>Insertion point for clones of a dimension—Baseline and Continue (in OCS)</td></tr><tr><td></td><td>DXF: X value; APP: 3D point</td></tr><tr><td>22, 32</td><td>DXF: Y and Z values of insertion point for clones of a dimension—Baseline and Continue (in OCS)</td></tr><tr><td>13</td><td>Definition point for linear and angular dimensions (in WCS)
DXF: X value; APP: 3D point</td></tr><tr><td>23, 33</td><td>DXF: Y and Z values of definition point for linear and angular dimensions (in WCS)</td></tr><tr><td>14</td><td>Definition point for linear and angular dimensions (in WCS)
DXF: X value; APP: 3D point</td></tr><tr><td>24, 34</td><td>DXF: Y and Z values of definition point for linear and angular dimensions (in WCS)</td></tr><tr><td>50</td><td>Angle of rotated, horizontal, or vertical dimensions</td></tr><tr><td>52</td><td>Linear dimension types with an oblique angle have an optional group code 52. When added to the rotation angle of the linear dimension (group code 50), it gives the angle of the extension lines</td></tr><tr><td>100</td><td>Subclass marker (AcDbRotatedDimension)</td></tr></table>

# Radial and Diameter Dimension Group Codes

The following group codes apply to radial and diameter dimensions. In addition to the group codes described here, those listed in Common Group Codes for Entities on page 61 and Common Dimension Group Codes on page 78 can also be present. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">Radial and diameter dimension group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbRadialDimension or AcDbDiametricDimension)</td></tr><tr><td>15</td><td>Definition point for diameter, radius, and angular dimensions (in WCS)
DXF: X value; APP: 3D point</td></tr><tr><td>25, 35</td><td>DXF: Y and Z values of definition point for diameter, radius, and angular dimensions (in WCS)</td></tr><tr><td>40</td><td>Leader length for radius and diameter dimensions</td></tr></table>

The point (15,25,35) specifies the first point of the dimension line on the circle/arc and the point (10,20,30) specifies the point opposite the first point. The point (11,21,31) specifies the midpoint of the dimension text.

![](images/8327093a3e2607c2fa04e4200717eff7a6ea4444ceaff69540f3de243d64ffc2.jpg)

The point (15,25,35) specifies the first point of the dimension line on the circle/arc and the point (10,20,30) specifies the center of the circle/arc. The point (11,21,31) specifies the midpoint of the dimension text.

![](images/c2078aa0f7d67eaee82786747fed845090c23f7a62fbbbe4914b9be5b1583f4e.jpg)

# Angular Dimension Group Codes

The following group codes apply to angular dimensions. In addition to the group codes described here, those listed in Common Group Codes for Entities on page 61 and Common Dimension Group Codes on page 78 can also be

present. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">Angular dimension group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDb3PointAngularDimension)</td></tr><tr><td>13</td><td>Definition point for linear and angular dimensions (in WCS)
DXF: X value; APP: 3D point</td></tr><tr><td>23, 33</td><td>DXF: Y and Z values of definition point for linear and angular dimensions (in WCS)</td></tr><tr><td>14</td><td>Definition point for linear and angular dimensions (in WCS)
DXF: X value; APP: 3D point</td></tr><tr><td>24, 34</td><td>DXF: Y and Z values of definition point for linear and angular dimensions (in WCS)</td></tr><tr><td>15</td><td>Definition point for diameter, radius, and angular dimensions (in WCS) DXF: X value; APP: 3D point</td></tr><tr><td>25, 35</td><td>DXF: Y and Z values of definition point for diameter, radius, and angular dimensions (in WCS)</td></tr><tr><td>16</td><td>Point defining dimension arc for angular dimensions (in OCS)
DXF: X value; APP: 3D point</td></tr><tr><td>26, 36</td><td>DXF: Y and Z values of point defining dimension arc for angular dimensions (in OCS)</td></tr></table>

The points (13,23,33) and (14,24,34) specify the endpoints of the line used to determine the first extension line. Points (10,20,30) and (15,25,35) specify the endpoints of the line used to determine the second extension line. Point (16,26,36) specifies the location of the dimension line arc. The point (11,21,31) specifies the midpoint of the dimension text.

![](images/d10dd787a5f23c3bd59c8bc4832e4af7ce4e1a9af4f0051f4893fcbeaed57cab.jpg)

The point (15,25,35) specifies the vertex of the angle. The points (13,23,33) and (14,24,34) specify the endpoints of the extension lines. The point

(10,20,30) specifies the location of the dimension line arc and the point (11,21,31) specifies the midpoint of the dimension text.

![](images/9aac50afdae7694bd94f2a67ab522855639ebc2e8a7942e3b3cc77a7405f6075.jpg)

# Ordinate Dimension Group Codes

The following group codes apply to ordinate dimensions. In addition to the group codes described here, those listed in Common Group Codes for Entities on page 61 and Common Dimension Group Codes on page 78 can also be present. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

Ordinate dimension group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbOrdinateDimension)</td></tr><tr><td>13</td><td>Definition point for linear and angular dimensions (in WCS)
DXF: X value; APP: 3D point</td></tr><tr><td>23, 33</td><td>DXF: Y and Z values of definition point for linear and angular dimensions (in WCS)</td></tr><tr><td>14</td><td>Definition point for linear and angular dimensions (in WCS)
DXF: X value; APP: 3D point</td></tr><tr><td>24, 34</td><td>DXF: Y and Z values of definition point for linear and angular dimensions (in WCS)</td></tr></table>

The point (13,23,33) specifies the feature location and the point (14,24,34) specifies the leader endpoint. The point (11,21,31) specifies the midpoint of the dimension text. Point (10,20,30) is placed at the origin of the UCS that is current when the dimension is created.

![](images/7d7f6c7b9f821ad678c3703227eb52a6974d5f4c383e140a06e777ffd0cd8ed0.jpg)

# Dimension Style Overrides

Dimension style overrides can be applied to dimension, leader, and tolerance entities. Any overrides applied to these entities are stored in the entity as xdata. The overridden dimension variable group codes and the related values are contained within group 1002 control strings. The following example shows the xdata of a dimension entity where the DIMTOL and DIMCLRE variables have been overridden.

```lisp
(setq diment (car (entsel))) ; Select dimension entity
(setq elst (entget diment '('ACAD))) ; Get entity definition list
(assoc -3 elst) ; Extract xdata only
```

# This code returns the following

```txt
(-3 ("ACAD") Start of the ACAD APPID section of xdata (1000 . "DSTYLE") (1002 . "{") Beginning of the dimstyle subsec tion (1070 . 177) (1070 . 3) The DIMCLRE (code 177) override + value (3) (1070 . 71) (1070 . 1) The DIMTOL (code 71) override + value (1) (1002 . "}")) End dimstyle subsection and ACAD section
```

# ELLIPSE

The following group codes apply to ellipse entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For

information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

Ellipse group codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbEllipse)</td>
    </tr>
    <tr>
        <td>10</td>
        <td>Center point (in WCS) DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>20, 30</td>
        <td>DXF: Y and Z values of center point (in WCS)</td>
    </tr>
    <tr>
        <td>11</td>
        <td>Endpoint of major axis, relative to the center (in WCS) DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>21, 31</td>
        <td>DXF: Y and Z values of endpoint of major axis, relative to the center (in WCS)</td>
    </tr>
    <tr>
        <td>210</td>
        <td>Extrusion direction (optional; default = 0, 0, 1) DXF: X value; APP: 3D vector</td>
    </tr>
    <tr>
        <td>220, 230</td>
        <td>DXF: Y and Z values of extrusion direction (optional)</td>
    </tr>
    <tr>
        <td>40</td>
        <td>Ratio of minor axis to major axis</td>
    </tr>
    <tr>
        <td>41</td>
        <td>Start parameter (this value is 0.0 for a full ellipse)</td>
    </tr>
    <tr>
        <td>42</td>
        <td>End parameter (this value is 2pi for a full ellipse)</td>
    </tr>
</table>
```

# HATCH

The following group codes apply to hatch and MPolygon entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

Hatch group codes

```html
<table><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbHatch)</td></tr><tr><td>10</td><td>Elevation point (in OCS)</td></tr></table>
```

# Hatch group codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td></td>
        <td>DXF: X value = 0; APP: 3D point (X and Y always equal 0, Z represents the elevation)</td>
    </tr>
    <tr>
        <td>20, 30</td>
        <td>DXF: Y and Z values of elevation point (in OCS) Y value = 0, Z represents the elevation</td>
    </tr>
    <tr>
        <td>210</td>
        <td>Extrusion direction (optional; default = 0, 0, 1) DXF: X value; APP: 3D vector</td>
    </tr>
    <tr>
        <td>220, 230</td>
        <td>DXF: Y and Z values of extrusion direction</td>
    </tr>
    <tr>
        <td>2</td>
        <td>Hatch pattern name</td>
    </tr>
    <tr>
        <td>70</td>
        <td>Solid fill flag (solid fill = 1; pattern fill = 0); for MPolygon, the version of MPolygon</td>
    </tr>
    <tr>
        <td>63</td>
        <td>For MPolygon, pattern fill color as the ACI</td>
    </tr>
    <tr>
        <td>71</td>
        <td>
            Associativity flag (associative = 1; non-associative = 0); for MPolygon, solid-fill flag (has solid fill =
            1; lacks solid fill = 0)
        </td>
    </tr>
    <tr>
        <td>91</td>
        <td>Number of boundary paths (loops)</td>
    </tr>
    <tr>
        <td>varies</td>
        <td>Boundary path data. Repeats number of times specified by code 91. See Boundary Path Data on page 90</td>
    </tr>
    <tr>
        <td>75</td>
        <td>
            Hatch style: 0 = Hatch &quot;odd parity&quot; area (Normal style) 1 = Hatch outermost area only (Outer
            style) 2 = Hatch through entire area (Ignore style)
        </td>
    </tr>
    <tr>
        <td>76</td>
        <td>Hatch pattern type: 0 = User-defined; 1 = Predefined; 2 = Custom</td>
    </tr>
    <tr>
        <td>52</td>
        <td>Hatch pattern angle (pattern fill only)</td>
    </tr>
    <tr>
        <td>41</td>
        <td>Hatch pattern scale or spacing (pattern fill only)</td>
    </tr>
    <tr>
        <td>73</td>
        <td>
            For MPolygon, boundary annotation flag (boundary is an annotated boundary = 1; boundary is not an annotated
            boundary = 0)
        </td>
    </tr>
    <tr>
        <td>77</td>
        <td>Hatch pattern double flag (pattern fill only):</td>
    </tr>
</table>
```

Hatch group codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td></td>
        <td>0 = not double; 1 = double</td>
    </tr>
    <tr>
        <td>78</td>
        <td>Number of pattern definition lines</td>
    </tr>
    <tr>
        <td>varies</td>
        <td>Pattern line data. Repeats number of times specified by code 78. See Pattern Data on page 94</td>
    </tr>
    <tr>
        <td>47</td>
        <td>
            Pixel size used to determine the density to perform various intersection and ray casting operations in hatch
            pattern computation for associative hatches and hatches created with the Flood method of hatching
        </td>
    </tr>
    <tr>
        <td>98</td>
        <td>Number of seed points</td>
    </tr>
    <tr>
        <td>11</td>
        <td>For MPolygon, offset vector</td>
    </tr>
    <tr>
        <td>99</td>
        <td>
            For MPolygon, number of degenerate boundary paths (loops), where a degenerate boundary path is a border that
            is ignored by the hatch
        </td>
    </tr>
    <tr>
        <td>10</td>
        <td>Seed point (in OCS)DXF: X value; APP: 2D point (multiple entries)</td>
    </tr>
    <tr>
        <td>20</td>
        <td>DXF: Y value of seed point (in OCS); (multiple entries)</td>
    </tr>
    <tr>
        <td>450</td>
        <td>
            Indicates solid hatch or gradient; if solid hatch, the values for the remaining codes are ignored but must
            be present. Optional; if code 450 is in the file, then the following codes must be in the file: 451, 452,
            453, 460, 461, 462, and 470. If code 450 is not in the file, then the following codes must not be in the
            file: 451, 452, 453, 460, 461, 462, and 4700 = Solid hatch1 = Gradient
        </td>
    </tr>
    <tr>
        <td>451</td>
        <td>Zero is reserved for future use</td>
    </tr>
    <tr>
        <td>452</td>
        <td>
            Records how colors were defined and is used only by dialog code:0 = Two-color gradient1 = Single-color
            gradient
        </td>
    </tr>
    <tr>
        <td>453</td>
        <td>Number of colors:0 = Solid hatch2 = Gradient</td>
    </tr>
    <tr>
        <td>460</td>
        <td>Rotation angle in radians for gradients (default = 0, 0)</td>
    </tr>
    <tr><td colspan="2">Hatch group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>461</td>
        <td>
            Gradient definition; corresponds to the Centered option on the Gradient Tab of the Boundary Hatch and Fill
            dialog box. Each gradient has two definitions, shifted and unshifted. A Shift value describes the blend of
            the two definitions that should be used. A value of 0.0 means only the unshifted version should be used, and
            a value of 1.0 means that only the shifted version should be used.
        </td>
    </tr>
    <tr>
        <td>462</td>
        <td>
            Color tint value used by dialog code (default = 0, 0; range is 0.0 to 1.0). The color tint value is a
            gradient color and controls the degree of tint in the dialog when the Hatch group code 452 is set to 1.
        </td>
    </tr>
    <tr>
        <td>463</td>
        <td>Reserved for future use: 0 = First value 1 = Second value</td>
    </tr>
    <tr>
        <td>470</td>
        <td>String (default = LINEAR)</td>
    </tr>
</table>
```

# Boundary Path Data

The boundary of each hatch object is defined by a path (or loop) that consists of one or more segments. Path segment data varies depending on the entity type (or types) that make up the path. Each path segment is defined by its own set of group codes. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Hatch boundary path data group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>92</td>
        <td>
            Boundary path type flag (bit coded): 0 = Default; 1 = External; 2 = Polyline 4 = Derived; 8 = Textbox; 16 =
            Outermost
        </td>
    </tr>
    <tr>
        <td>varies</td>
        <td>Polyline boundary type data (only if boundary = polyline). See Polyline boundary data table below</td>
    </tr>
    <tr>
        <td>93</td>
        <td>Number of edges in this boundary path (only if boundary is not a polyline)</td>
    </tr>
    <tr>
        <td>72</td>
        <td>
            Edge type (only if boundary is not a polyline): 1 = Line; 2 = Circular arc; 3 = Elliptic arc; 4 = Spline
        </td>
    </tr>
</table>
```

Hatch boundary path data group codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>varies</td>
        <td>Edge type data (only if boundary is not a polyline). See appropriate Edge data table below</td>
    </tr>
    <tr>
        <td>97</td>
        <td>Number of source boundary objects</td>
    </tr>
    <tr>
        <td>330</td>
        <td>Reference to source boundary objects (multiple entries)</td>
    </tr>
</table>
```

Polyline boundary data group codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>72</td>
        <td>Has bulge flag</td>
    </tr>
    <tr>
        <td>73</td>
        <td>Is closed flag</td>
    </tr>
    <tr>
        <td>93</td>
        <td>Number of polyline vertices</td>
    </tr>
    <tr>
        <td>10</td>
        <td>Vertex location (in OCS) DXF: X value; APP: 2D point (multiple entries)</td>
    </tr>
    <tr>
        <td>20</td>
        <td>DXF: Y value of vertex location (in OCS) (multiple entries)</td>
    </tr>
    <tr>
        <td>42</td>
        <td>Bulge (optional, default = 0)</td>
    </tr>
</table>
```

Line edge data group codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>10</td>
        <td>Start point (in OCS)DXF: X value; APP: 2D point</td>
    </tr>
    <tr>
        <td>20</td>
        <td>DXF: Y value of start point (in OCS)</td>
    </tr>
    <tr>
        <td>11</td>
        <td>Endpoint (in OCS)DXF: X value; APP: 2D point</td>
    </tr>
</table>
```

Line edge data group codes

Group code Description

21 DXF: Y value of endpoint (in OCS)

Arc edge data group codes

Group code Description

10 Center point (in OCS)

DXF: X value; APP: 2D point

20 DXF: Y value of center point (in OCS)

40 Radius

50 Start angle

51 End angle

73 Is counterclockwise flag

Ellipse edge data group codes

Group code Description

10 Center point (in OCS)
DXF: X value; APP: 2D point
20 DXF: Y value of center point (in OCS)
11 Endpoint of major axis relative to center point (in OCS)
DXF: X value; APP: 2D point
21 DXF: Y value of endpoint of major axis (in OCS)
40 Length of minor axis (percentage of major axis length)
50 Start angle
51 End angle

# Ellipse edge data group codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>73</td>
        <td>Is counterclockwise flag</td>
    </tr>
    <tr><td colspan="2"></td></tr>
    <tr><td colspan="2">Spline edge data group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>94</td>
        <td>Degree</td>
    </tr>
    <tr>
        <td>73</td>
        <td>Rational</td>
    </tr>
    <tr>
        <td>74</td>
        <td>Periodic</td>
    </tr>
    <tr>
        <td>95</td>
        <td>Number of knots</td>
    </tr>
    <tr>
        <td>96</td>
        <td>Number of control points</td>
    </tr>
    <tr>
        <td>40</td>
        <td>Knot values (multiple entries)</td>
    </tr>
    <tr>
        <td>10</td>
        <td>Control point (in OCS) DXF: X value; APP: 2D point</td>
    </tr>
    <tr>
        <td>20</td>
        <td>DXF: Y value of control point (in OCS)</td>
    </tr>
    <tr>
        <td>42</td>
        <td>Weights (optional, default = 1)</td>
    </tr>
    <tr>
        <td>97</td>
        <td>Number of fit data</td>
    </tr>
    <tr>
        <td>11</td>
        <td>Fit datum (in OCS) DXF: X value; APP: 2D point</td>
    </tr>
    <tr>
        <td>21</td>
        <td>DXF: Y value of fit datum (in OCS)</td>
    </tr>
    <tr>
        <td>12</td>
        <td>Start tangent DXF: X value; APP: 2D vector</td>
    </tr>
    <tr>
        <td>22</td>
        <td>DXF: Y value of start tangent (in OCS)</td>
    </tr>
    <tr>
        <td>13</td>
        <td>End tangent DXF: X value; APP: 2D vector</td>
    </tr>
</table>
```

Spline edge data group codes

Group code Description

23 DXF: Y value of end tangent (in OCS)

# Pattern Data

The following pattern data codes repeat for each pattern definition line. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

Hatch pattern data group codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>53</td>
        <td>Pattern line angle</td>
    </tr>
    <tr>
        <td>43</td>
        <td>Pattern line base point, X component</td>
    </tr>
    <tr>
        <td>44</td>
        <td>Pattern line base point, Y component</td>
    </tr>
    <tr>
        <td>45</td>
        <td>Pattern line offset, X component</td>
    </tr>
    <tr>
        <td>46</td>
        <td>Pattern line offset, Y component</td>
    </tr>
    <tr>
        <td>79</td>
        <td>Number of dash length items</td>
    </tr>
    <tr>
        <td>49</td>
        <td>Dash length (multiple entries)</td>
    </tr>
</table>
```

# HELIX

The following group codes apply to helix entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

Helix group codes

Group code Description

Spline data

```html
<table>
    <tr><td colspan="2">Helix group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbHelix)</td>
    </tr>
    <tr>
        <td>90</td>
        <td>Major release number</td>
    </tr>
    <tr>
        <td>91</td>
        <td>Maintenance release number</td>
    </tr>
    <tr>
        <td>10, 20, 30</td>
        <td>Axis base point</td>
    </tr>
    <tr>
        <td>11, 21, 31</td>
        <td>Start point</td>
    </tr>
    <tr>
        <td>12, 22, 32</td>
        <td>Axis vector</td>
    </tr>
    <tr>
        <td>40</td>
        <td>Radius</td>
    </tr>
    <tr>
        <td>41</td>
        <td>Number of turns</td>
    </tr>
    <tr>
        <td>42</td>
        <td>Turn height</td>
    </tr>
    <tr>
        <td>290</td>
        <td>Handedness; 0 = left, 1 = right</td>
    </tr>
    <tr>
        <td>280</td>
        <td>Constrain type 0 = Constrain turn height 1 = Constrain turns 2 = Constrain height</td>
    </tr>
</table>
```

# IMAGE

The following group codes apply to image entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Image group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbRasterImage)</td>
    </tr>
    <tr>
        <td>90</td>
        <td>Class version</td>
    </tr>
    <tr>
        <td>10</td>
        <td>Insertion point (in WCS) DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>20, 30</td>
        <td>DXF: Y and Z values of insertion point (in WCS)</td>
    </tr>
    <tr>
        <td>11</td>
        <td>
            U-vector of a single pixel (points along the visual bottom of the image, starting at the insertion point)
            (in WCS) DXF: X value; APP: 3D point
        </td>
    </tr>
    <tr>
        <td>21, 31</td>
        <td>DXF: Y and Z values U-vector (in WCS)</td>
    </tr>
    <tr>
        <td>12</td>
        <td>
            V-vector of a single pixel (points along the visual left side of the image, starting at the insertion point)
            (in WCS) DXF: X value; APP: 3D point
        </td>
    </tr>
    <tr>
        <td>22, 32</td>
        <td>DXF: Y and Z values of V-vector (in WCS)</td>
    </tr>
    <tr>
        <td>13</td>
        <td>Image size in pixels DXF: U value; APP: 2D point (U and V values)</td>
    </tr>
    <tr>
        <td>23</td>
        <td>DXF: V value of image size in pixels</td>
    </tr>
    <tr>
        <td>340</td>
        <td>Hard reference to imagedef object</td>
    </tr>
    <tr>
        <td>70</td>
        <td>
            Image display properties: 1 = Show image 2 = Show image when not aligned with screen 4 = Use clipping
            boundary 8 = Transparency is on
        </td>
    </tr>
    <tr>
        <td>280</td>
        <td>Clipping state: 0 = Off; 1 = On</td>
    </tr>
    <tr>
        <td>281</td>
        <td>Brightness value (0-100; default = 50)</td>
    </tr>
    <tr>
        <td>282</td>
        <td>Contrast value (0-100; default = 50)</td>
    </tr>
    <tr>
        <td>283</td>
        <td>Fade value (0-100; default = 0)</td>
    </tr>
    <tr>
        <td>360</td>
        <td>Hard reference to imagedef_reactor object</td>
    </tr>
    <tr>
        <td>71</td>
        <td>Clipping boundary type. 1 = Rectangular; 2 = Polygonal</td>
    </tr>
    <tr>
        <td>91</td>
        <td>Number of clip boundary vertices that follow</td>
    </tr>
    <tr>
        <td>14</td>
        <td>
            Clip boundary vertex (in OCS) DXF: X value; APP: 2D point (multiple entries) NOTE 1) For rectangular clip
            boundary type, two opposite corners must be specified. Default is (-0.5,-0.5), (size.x-0.5, size.y-0.5). 2)
            For polygonal clip boundary type, three or more vertices must be specified. Polygonal vertices must be
            listed sequentially
        </td>
    </tr>
    <tr>
        <td>24</td>
        <td>DXF: Y value of clip boundary vertex (in OCS) (multiple entries)</td>
    </tr>
    <tr>
        <td>290</td>
        <td>Clip Mode: 0 = Outside Mode; 1 = Inside Mode</td>
    </tr>
</table>
```

# INSERT

The following group codes apply to insert (block reference) entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Insert group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbBlockReference)</td>
    </tr>
    <tr>
        <td>66</td>
        <td>
            Variable attributes-follow flag (optional; default = 0); if the value of attributes-follow flag is 1, a
            series of attribute entities is expected to follow the insert, terminated by a seqend entity
        </td>
    </tr>
    <tr>
        <td>2</td>
        <td>Block name</td>
    </tr>
    <tr>
        <td>10</td>
        <td>Insertion point (in OCS) DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>20, 30</td>
        <td>DXF: Y and Z values of insertion point (in OCS)</td>
    </tr>
    <tr>
        <td>41</td>
        <td>X scale factor (optional; default = 1)</td>
    </tr>
    <tr>
        <td>42</td>
        <td>Y scale factor (optional; default = 1)</td>
    </tr>
    <tr>
        <td>43</td>
        <td>Z scale factor (optional; default = 1)</td>
    </tr>
    <tr>
        <td>50</td>
        <td>Rotation angle (optional; default = 0)</td>
    </tr>
    <tr>
        <td>70</td>
        <td>Column count (optional; default = 1)</td>
    </tr>
    <tr>
        <td>71</td>
        <td>Row count (optional; default = 1)</td>
    </tr>
    <tr>
        <td>44</td>
        <td>Column spacing (optional; default = 0)</td>
    </tr>
    <tr>
        <td>45</td>
        <td>Row spacing (optional; default = 0)</td>
    </tr>
    <tr>
        <td>210</td>
        <td>Extrusion direction (optional; default = 0, 0, 1) DXF: X value; APP: 3D vector</td>
    </tr>
    <tr>
        <td>220, 230</td>
        <td>DXF: Y and Z values of extrusion direction (optional)</td>
    </tr>
</table>
```

# LEADER

The following group codes apply to leader entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Leader group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbLeader)</td>
    </tr>
    <tr>
        <td>3</td>
        <td>Dimension style name</td>
    </tr>
    <tr>
        <td>71</td>
        <td>Arrowhead flag: 0 = Disabled; 1 = Enabled</td>
    </tr>
    <tr>
        <td>72</td>
        <td>Leader path type: 0 = Straight line segments; 1 = Spline</td>
    </tr>
    <tr>
        <td>73</td>
        <td>
            Leader creation flag (default = 3): 0 = Created with text annotation 1 = Created with tolerance annotation 2
            = Created with block reference annotation
        </td>
    </tr>
</table>
```

# Leader group codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td></td>
        <td>3 = Created without any annotation</td>
    </tr>
    <tr>
        <td>74</td>
        <td>
            Hookline direction flag:0 = Hookline (or end of tangent for a splined leader) is the opposite direction from
            the horizontal vector1 = Hookline (or end of tangent for a splined leader) is the same direction as
            horizontal vector(see code 75)
        </td>
    </tr>
    <tr>
        <td>75</td>
        <td>Hookline flag: 0 = No hookline; 1 = Has a hookline</td>
    </tr>
    <tr>
        <td>40</td>
        <td>Text annotation height</td>
    </tr>
    <tr>
        <td>41</td>
        <td>Text annotation width</td>
    </tr>
    <tr>
        <td>76</td>
        <td>Number of vertices in leader (ignored for OPEN)</td>
    </tr>
    <tr>
        <td>10</td>
        <td>Vertex coordinates (one entry for each vertex)DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>20, 30</td>
        <td>DXF: Y and Z values of vertex coordinates</td>
    </tr>
    <tr>
        <td>77</td>
        <td>Color to use if leader's DIMCLR D = BYBLOCK</td>
    </tr>
    <tr>
        <td>340</td>
        <td>Hard reference to associated annotation (mtext, tolerance, or insert entity)</td>
    </tr>
    <tr>
        <td>210</td>
        <td>Normal vectorDXF: X value; APP: 3D vector</td>
    </tr>
    <tr>
        <td>220, 230</td>
        <td>DXF: Y and Z values of normal vector</td>
    </tr>
    <tr>
        <td>211</td>
        <td>“Horizontal” direction for leaderDXF: X value; APP: 3D vector</td>
    </tr>
    <tr>
        <td>221, 231</td>
        <td>DXF: Y and Z values of “horizontal” direction for leader</td>
    </tr>
    <tr>
        <td>212</td>
        <td>Offset of last leader vertex from block reference insertion pointDXF: X value; APP: 3D vector</td>
    </tr>
    <tr>
        <td>222, 232</td>
        <td>DXF: Y and Z values of offset</td>
    </tr>
    <tr><td colspan="2">Leader group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>213</td>
        <td>Offset of last leader vertex from annotation placement point DXF: X value; APP: 3D vector</td>
    </tr>
    <tr>
        <td>223, 233</td>
        <td>DXF: Y and Z values of offset</td>
    </tr>
</table>
```

Xdata belonging to the application ID "ACAD" follows a leader entity if any dimension overrides have been applied to this entity. See Dimension Style Overrides on page 86.

# LIGHT

The following group codes apply to light entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Light group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbLight)</td>
    </tr>
    <tr>
        <td>90</td>
        <td>Version number</td>
    </tr>
    <tr>
        <td>1</td>
        <td>Light name</td>
    </tr>
    <tr>
        <td>70</td>
        <td>Light type (distance = 1; point = 2; spot = 3)</td>
    </tr>
    <tr>
        <td>290</td>
        <td>Status</td>
    </tr>
    <tr>
        <td>291</td>
        <td>Plot glyph</td>
    </tr>
    <tr>
        <td>40</td>
        <td>Intensity</td>
    </tr>
    <tr>
        <td>10</td>
        <td>Light Position DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>20, 30</td>
        <td>DXF: X, Y, and Z values of the light position</td>
    </tr>
    <tr>
        <td>11</td>
        <td>Target location</td>
    </tr>
</table>
```

# Light group codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td></td>
        <td>DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>21, 31</td>
        <td>DXF: X, Y, and Z values of the target location</td>
    </tr>
    <tr>
        <td>72</td>
        <td>Attenuation type 0 = None 1 = Inverse Linear 2 = Inverse Square</td>
    </tr>
    <tr>
        <td>292</td>
        <td>Use attenuation limits</td>
    </tr>
    <tr>
        <td>41</td>
        <td>Attenuation start limit</td>
    </tr>
    <tr>
        <td>42</td>
        <td>Attenuation end limit</td>
    </tr>
    <tr>
        <td>50</td>
        <td>Hotspot angle</td>
    </tr>
    <tr>
        <td>51</td>
        <td>Falloff angle</td>
    </tr>
    <tr>
        <td>293</td>
        <td>Cast shadows</td>
    </tr>
    <tr>
        <td>73</td>
        <td>Shadow Type 0 = Ray traced shadows 1 = Shadow maps</td>
    </tr>
    <tr>
        <td>91</td>
        <td>Shadow map size</td>
    </tr>
    <tr>
        <td>280</td>
        <td>Shadow map softness</td>
    </tr>
</table>
```

# LINE

The following group codes apply to line entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For

information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

Line group codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbLine)</td>
    </tr>
    <tr>
        <td>39</td>
        <td>Thickness (optional; default = 0)</td>
    </tr>
    <tr>
        <td>10</td>
        <td>Start point (in WCS) DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>20, 30</td>
        <td>DXF: Y and Z values of start point (in WCS)</td>
    </tr>
    <tr>
        <td>11</td>
        <td>Endpoint (in WCS) DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>21, 31</td>
        <td>DXF: Y and Z values of endpoint (in WCS)</td>
    </tr>
    <tr>
        <td>210</td>
        <td>Extrusion direction (optional; default = 0, 0, 1) DXF: X value; APP: 3D vector</td>
    </tr>
    <tr>
        <td>220, 230</td>
        <td>DXF: Y and Z values of extrusion direction (optional)</td>
    </tr>
</table>
```

# LWPOLYLINE

The following group codes apply to lwpolyline entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

Lwpolyline group codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbPolyline)</td>
    </tr>
    <tr>
        <td>90</td>
        <td>Number of vertices</td>
    </tr>
    <tr>
        <td>70</td>
        <td>Polyline flag (bit-coded); default is 0: 1 = Closed; 128 = Plinegen</td>
    </tr>
    <tr><td colspan="2">Lwpolyline group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>43</td>
        <td>Constant width (optional; default = 0). Not used if variable width (codes 40 and/or 41) is set</td>
    </tr>
    <tr>
        <td>38</td>
        <td>Elevation (optional; default = 0)</td>
    </tr>
    <tr>
        <td>39</td>
        <td>Thickness (optional; default = 0)</td>
    </tr>
    <tr>
        <td>10</td>
        <td>Vertex coordinates (in OCS), multiple entries; one entry for each vertexDXF: X value; APP: 2D point</td>
    </tr>
    <tr>
        <td>20</td>
        <td>DXF: Y value of vertex coordinates (in OCS), multiple entries; one entry for each vertex</td>
    </tr>
    <tr>
        <td>91</td>
        <td>Vertex identifier</td>
    </tr>
    <tr>
        <td>40</td>
        <td>
            Starting width (multiple entries; one entry for each vertex) (optional; default = 0; multiple entries). Not
            used if constant width (code 43) is set
        </td>
    </tr>
    <tr>
        <td>41</td>
        <td>
            End width (multiple entries; one entry for each vertex) (optional; default = 0; multiple entries). Not used
            if constant width (code 43) is set
        </td>
    </tr>
    <tr>
        <td>42</td>
        <td>Bulge (multiple entries; one entry for each vertex) (optional; default = 0)</td>
    </tr>
    <tr>
        <td>210</td>
        <td>Extrusion direction (optional; default = 0, 0, 1)DXF: X value; APP: 3D vector</td>
    </tr>
    <tr>
        <td>220, 230</td>
        <td>DXF: Y and Z values of extrusion direction (optional)</td>
    </tr>
</table>
```

# MESH

The following group codes apply to the mesh entity. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Mesh group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbSubDMesh)</td>
    </tr>
    <tr>
        <td>71</td>
        <td>Version number</td>
    </tr>
    <tr>
        <td>72</td>
        <td>"Blend Crease" property 0 = Turn off 1 = Turn on</td>
    </tr>
    <tr>
        <td>91</td>
        <td>Number of subdivision level</td>
    </tr>
    <tr>
        <td>92</td>
        <td>Vertex count of level 0</td>
    </tr>
    <tr>
        <td>10</td>
        <td>Vertex position</td>
    </tr>
    <tr>
        <td>93</td>
        <td>Size of face list of level 0</td>
    </tr>
    <tr>
        <td>90</td>
        <td>Face list item</td>
    </tr>
    <tr>
        <td>94</td>
        <td>Edge count of level 0</td>
    </tr>
    <tr>
        <td>90</td>
        <td>Vertex index of each edge</td>
    </tr>
    <tr>
        <td>95</td>
        <td>Edge crease count of level 0</td>
    </tr>
    <tr>
        <td>140</td>
        <td>Edge create value</td>
    </tr>
    <tr>
        <td>90</td>
        <td>Count of sub-entity which property has been overridden</td>
    </tr>
    <tr>
        <td>91</td>
        <td>Sub-entity marker</td>
    </tr>
    <tr>
        <td>92</td>
        <td>Count of property was overridden</td>
    </tr>
    <tr>
        <td>90</td>
        <td>Property type 0 = Color 1 = Material 2 = Transparency 3 = Material mapper</td>
    </tr>
</table>

```

# MLINE

The following group codes apply to mline entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For

information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Mline group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbMline)</td>
    </tr>
    <tr>
        <td>2</td>
        <td>
            String of up to 32 characters. The name of the style used for this mline. An entry for this style must exist
            in the MLINESTYLE dictionary. Do not modify this field without also updating the associated entry in the
            MLINESTYLE dictionary
        </td>
    </tr>
    <tr>
        <td>340</td>
        <td>Pointer-handle/ID of MLINESTYLE object</td>
    </tr>
    <tr>
        <td>40</td>
        <td>Scale factor</td>
    </tr>
    <tr>
        <td>70</td>
        <td>Justification: 0 = Top; 1 = Zero; 2 = Bottom</td>
    </tr>
    <tr>
        <td>71</td>
        <td>
            Flags (bit-coded values): 1 = Has at least one vertex (code 72 is greater than 0) 2 = Closed 4 = Suppress
            start caps 8 = Suppress end caps
        </td>
    </tr>
    <tr>
        <td>72</td>
        <td>Number of vertices</td>
    </tr>
    <tr>
        <td>73</td>
        <td>Number of elements in MLINESTYLE definition</td>
    </tr>
    <tr>
        <td>10</td>
        <td>Start point (in WCS) DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>20, 30</td>
        <td>DXF: Y and Z values of start point (in WCS)</td>
    </tr>
    <tr>
        <td>210</td>
        <td>Extrusion direction (optional; default = 0, 0, 1) DXF: X value; APP: 3D vector</td>
    </tr>
    <tr>
        <td>220, 230</td>
        <td>DXF: Y and Z values of extrusion direction (optional)</td>
    </tr>
    <tr>
        <td>11</td>
        <td>Vertex coordinates (multiple entries; one entry for each vertex) DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>21, 31</td>
        <td>DXF: Y and Z values of vertex coordinates</td>
    </tr>
    <tr>
        <td>12</td>
        <td>Direction vector of segment starting at this vertex (multiple entries; one for each vertex)</td>
    </tr>
</table>
```

Mline group codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td></td>
        <td>DXF: X value; APP: 3D vector</td>
    </tr>
    <tr>
        <td>22, 32</td>
        <td>DXF: Y and Z values of direction vector of segment starting at this vertex</td>
    </tr>
    <tr>
        <td>13</td>
        <td>
            Direction vector of miter at this vertex (multiple entries: one for each vertex)DXF: X value; APP: 3D vector
        </td>
    </tr>
    <tr>
        <td>23, 33</td>
        <td>DXF: Y and Z values of direction vector of miter</td>
    </tr>
    <tr>
        <td>74</td>
        <td>Number of parameters for this element (repeats for each element in segment)</td>
    </tr>
    <tr>
        <td>41</td>
        <td>Element parameters (repeats based on previous code 74)</td>
    </tr>
    <tr>
        <td>75</td>
        <td>Number of area fill parameters for this element (repeats for each element in segment)</td>
    </tr>
    <tr>
        <td>42</td>
        <td>Area fill parameters (repeats based on previous code 75)</td>
    </tr>
</table>
```

The group code 41 parameterization is a list of real values, one real per group code 41. The list may contain zero or more items. The first group code 41 value is the distance from the segment vertex along the miter vector to the point where the line element's path intersects the miter vector. The next group code 41 value is the distance along the line element's path from the point defined by the first group 41 to the actual start of the line element. The next is the distance from the start of the line element to the first break (or cut) in the line element. The successive group code 41 values continue to list the start and stop points of the line element in this segment of the mline. Linetypes do not affect group 41 lists.

The group code 42 parameterization is also a list of real values. Similar to the 41 parameterization, it describes the parameterization of the fill area for this mline segment. The values are interpreted identically to the 41 parameters and when taken as a whole for all line elements in the mline segment, they define the boundary of the fill area for the mline segment.

A common example of the use of the group code 42 mechanism is when an unfilled mline crosses over a filled mline and mledit is used to cause the filled mline to appear unfilled in the crossing area. This would result in two group 42s for each line element in the affected mline segment; one for the fill stop and one for the fill start.

The 2 group codes in mline entities and mlinestyle objects are redundant fields. These groups should not be modified under any circumstances, although it is safe to read them and use their values. The correct fields to modify are as follows:

Mline The 340 group in the same object, which indicates the proper MLINESTYLE object.

Mlinestyle The 3 group value in the MLINSTYLE dictionary, which precedes the 350 group that has the handle or entity name of the current mlinestyle.

# MLEADERSTYLE

The following group codes apply to m leaderstyle entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">MLeaderstyle group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>170</td>
        <td>Content Type</td>
    </tr>
    <tr>
        <td>171</td>
        <td>DrawMLEaderOrder Type</td>
    </tr>
    <tr>
        <td>172</td>
        <td>DrawLeaderOrder Type</td>
    </tr>
    <tr>
        <td>90</td>
        <td>MaxLeader Segments Points</td>
    </tr>
    <tr>
        <td>40</td>
        <td>First Segment Angle Constraint</td>
    </tr>
    <tr>
        <td>41</td>
        <td>Second Segment Angle Constraint</td>
    </tr>
    <tr>
        <td>173</td>
        <td>LeaderLineStyle</td>
    </tr>
    <tr>
        <td>91</td>
        <td>LeaderLineStyle</td>
    </tr>
    <tr>
        <td>340</td>
        <td>LeaderLineStyle ID</td>
    </tr>
    <tr>
        <td>92</td>
        <td>LeaderLineWeight</td>
    </tr>
    <tr>
        <td>290</td>
        <td>Enable Landing</td>
    </tr>
    <tr>
        <td>42</td>
        <td>Landing Gap</td>
    </tr>
    <tr>
        <td>291</td>
        <td>Enable Dogleg</td>
    </tr>
    <tr>
        <td>43</td>
        <td>Dogleg Length</td>
    </tr>
    <tr>
        <td>3</td>
        <td>Mleader Style Description</td>
    </tr>
    <tr>
        <td>341</td>
        <td>Arrowhead ID</td>
    </tr>
    <tr>
        <td>44</td>
        <td>Arrowhead Size</td>
    </tr>
    <tr>
        <td>300</td>
        <td>Default MText Contents</td>
    </tr>
    <tr>
        <td>342</td>
        <td>mTextStyleld</td>
    </tr>
    <tr>
        <td>174</td>
        <td>Text Left Attachment Type</td>
    </tr>
    <tr>
        <td>175</td>
        <td>Text Angle Type</td>
    </tr>
    <tr>
        <td>176</td>
        <td>Text Alignment Type</td>
    </tr>
    <tr>
        <td>178</td>
        <td>Text Right Attachment Type</td>
    </tr>
    <tr>
        <td>93</td>
        <td>Text Color</td>
    </tr>
    <tr>
        <td>45</td>
        <td>Text Height</td>
    </tr>
    <tr>
        <td>292</td>
        <td>Enable Frame Text</td>
    </tr>
    <tr>
        <td>297</td>
        <td>Text Align Always Left</td>
    </tr>
    <tr>
        <td>46</td>
        <td>Align Space</td>
    </tr>
    <tr>
        <td>343</td>
        <td>Block Content ID</td>
    </tr>
    <tr>
        <td>94</td>
        <td>Block Content Color</td>
    </tr>
    <tr>
        <td>47</td>
        <td>Block Content Scale on X-axis</td>
    </tr>
    <tr>
        <td>49</td>
        <td>Block Content Scale on Y-axis</td>
    </tr>
    <tr>
        <td>140</td>
        <td>Block Content Scale on Z-axis</td>
    </tr>
    <tr>
        <td>293</td>
        <td>Enable Block Content Scale</td>
    </tr>
    <tr>
        <td>141</td>
        <td>Block Content Rotation</td>
    </tr>
    <tr>
        <td>294</td>
        <td>Enable Block Content Rotation</td>
    </tr>
    <tr>
        <td>177</td>
        <td>Block Content Connection Type</td>
    </tr>
    <tr>
        <td>142</td>
        <td>Scale</td>
    </tr>
    <tr>
        <td>295</td>
        <td>Overwrite Property Value</td>
    </tr>
    <tr>
        <td>296</td>
        <td>Is Annotative</td>
    </tr>
    <tr>
        <td>143</td>
        <td>Break Gap Size</td>
    </tr>
    <tr>
        <td>271</td>
        <td>Text attachment direction for MText contents:0 = Horizontal1 = Vertical</td>
    </tr>
    <tr>
        <td>272</td>
        <td>Bottom text attachment direction:9 = Center10 = Underline and Center</td>
    </tr>
    <tr>
        <td>273</td>
        <td>Top text attachment direction:9 = Center10 = Overline and Center</td>
    </tr>
</table>
```

# MLEADER

MLEader entity definitions consist of group codes that are common to all MLeader types, followed by codes specific to the type.

# Common MLeader Group Codes

The following group codes apply to all mleaderstyle entity types. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

Common MLeader Line Group Codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>340</td>
        <td>Leader Style Id</td>
    </tr>
    <tr>
        <td>90</td>
        <td>Property Override Flag</td>
    </tr>
    <tr>
        <td>170</td>
        <td>LeaderLineStyle</td>
    </tr>
    <tr>
        <td>91</td>
        <td>Leade LineColor</td>
    </tr>
    <tr>
        <td>341</td>
        <td>LeaderLineStyleID</td>
    </tr>
    <tr>
        <td>171</td>
        <td>LeaderLine Weight</td>
    </tr>
    <tr>
        <td>290</td>
        <td>Enable Landing</td>
    </tr>
    <tr>
        <td>291</td>
        <td>Enable Dogleg</td>
    </tr>
    <tr>
        <td>41</td>
        <td>Dogleg Length</td>
    </tr>
    <tr>
        <td>342</td>
        <td>Arrowhead ID</td>
    </tr>
    <tr>
        <td>42</td>
        <td>Arrowhead Size</td>
    </tr>
    <tr>
        <td>172</td>
        <td>Content Type</td>
    </tr>
    <tr>
        <td>343</td>
        <td>Text Style ID</td>
    </tr>
    <tr>
        <td>173</td>
        <td>Text Left Attachment Type</td>
    </tr>
    <tr>
        <td>95</td>
        <td>Text Right Attachment Type</td>
    </tr>
    <tr>
        <td>174</td>
        <td>Text Angle Type</td>
    </tr>
    <tr>
        <td>175</td>
        <td>Text Alignment Type</td>
    </tr>
</table>
```

Common MLeader Line Group Codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>92</td>
        <td>Text Color</td>
    </tr>
    <tr>
        <td>292</td>
        <td>Enable Frame Text</td>
    </tr>
    <tr>
        <td>344</td>
        <td>Block Content ID</td>
    </tr>
    <tr>
        <td>93</td>
        <td>Block Content Color</td>
    </tr>
    <tr>
        <td>10</td>
        <td>Block Content Scale</td>
    </tr>
    <tr>
        <td>43</td>
        <td>Block Content Rotation</td>
    </tr>
    <tr>
        <td>176</td>
        <td>Block Content Connection Type</td>
    </tr>
    <tr>
        <td>293</td>
        <td>Enable Annotation Scale</td>
    </tr>
    <tr>
        <td>94</td>
        <td>Arrowhead Index</td>
    </tr>
    <tr>
        <td>345</td>
        <td>Arrowhead ID</td>
    </tr>
    <tr>
        <td>330</td>
        <td>Block AttributeId</td>
    </tr>
    <tr>
        <td>177</td>
        <td>Block Attribute Index</td>
    </tr>
    <tr>
        <td>44</td>
        <td>Block Attribute Width</td>
    </tr>
    <tr>
        <td>302</td>
        <td>Block Attribute Text String</td>
    </tr>
    <tr>
        <td>294</td>
        <td>Text Direction Negative</td>
    </tr>
    <tr>
        <td>178</td>
        <td>Text Align in IPE</td>
    </tr>
    <tr>
        <td>179</td>
        <td>Text Attachment Point</td>
    </tr>
    <tr>
        <td>271</td>
        <td>Text attachment direction for MText contents: 0 = Horizontal 1 = Vertical</td>
    </tr>
    <tr>
        <td>272</td>
        <td>Bottom text attachment direction:</td>
    </tr>
</table>
```

Common MLeader Line Group Codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td></td>
        <td>9 = Center</td>
    </tr>
    <tr>
        <td></td>
        <td>10 = Underline and Center</td>
    </tr>
    <tr>
        <td>273</td>
        <td>Top text attachment direction:</td>
    </tr>
    <tr>
        <td></td>
        <td>9 = Center</td>
    </tr>
    <tr>
        <td></td>
        <td>10 = Overline and Center</td>
    </tr>
</table>
```

# MLeader Context Data Group Codes

The following group codes apply to all mleader entity types' context data. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

MLEader Context Data group codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>40</td>
        <td>Content Scale</td>
    </tr>
    <tr>
        <td>10,20,30</td>
        <td>Content Base Position</td>
    </tr>
    <tr>
        <td>41</td>
        <td>Text Height</td>
    </tr>
    <tr>
        <td>140</td>
        <td>Arrowhead Size</td>
    </tr>
    <tr>
        <td>145</td>
        <td>Landing Gap</td>
    </tr>
    <tr>
        <td>290</td>
        <td>hasMText</td>
    </tr>
    <tr>
        <td>304</td>
        <td>Default Text Contents</td>
    </tr>
    <tr>
        <td>11,21,31</td>
        <td>Text Normal Direction</td>
    </tr>
    <tr>
        <td>340</td>
        <td>Text Style ID</td>
    </tr>
    <tr>
        <td>12,22,32</td>
        <td>Text Location</td>
    </tr>
    <tr>
        <td>13,23,33</td>
        <td>Text Direction</td>
    </tr>
    <tr><td colspan="2">MLeader Context Data group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>42</td>
        <td>Text Rotation</td>
    </tr>
    <tr>
        <td>43</td>
        <td>Text Width</td>
    </tr>
    <tr>
        <td>44</td>
        <td>Text Height</td>
    </tr>
    <tr>
        <td>45</td>
        <td>Text Line Spacing Factor</td>
    </tr>
    <tr>
        <td>170</td>
        <td>Text Line Spacing Style</td>
    </tr>
    <tr>
        <td>90</td>
        <td>Text Color</td>
    </tr>
    <tr>
        <td>171</td>
        <td>Text Attachment</td>
    </tr>
    <tr>
        <td>172</td>
        <td>Text Flow Direction</td>
    </tr>
    <tr>
        <td>91</td>
        <td>Text Background Color</td>
    </tr>
    <tr>
        <td>141</td>
        <td>Text Background Scale Factor</td>
    </tr>
    <tr>
        <td>92</td>
        <td>Text Background Transparency</td>
    </tr>
    <tr>
        <td>291</td>
        <td>Is Text Background Color On</td>
    </tr>
    <tr>
        <td>292</td>
        <td>Is Text Background Fill On</td>
    </tr>
    <tr>
        <td>173</td>
        <td>Text Column Type</td>
    </tr>
    <tr>
        <td>293</td>
        <td>Use Text Auto Height</td>
    </tr>
    <tr>
        <td>142</td>
        <td>Text Column Width</td>
    </tr>
    <tr>
        <td>143</td>
        <td>Text Column Gutter Width</td>
    </tr>
    <tr>
        <td>294</td>
        <td>Text Column Flow Reversed</td>
    </tr>
    <tr>
        <td>144</td>
        <td>Text Column Height</td>
    </tr>
    <tr>
        <td>295</td>
        <td>Text Use Word Break</td>
    </tr>
    <tr>
        <td>296</td>
        <td>HasBlock</td>
    </tr>
    <tr>
        <td>341</td>
        <td>Block Content ID</td>
    </tr>
    <tr>
        <td>14,24,34</td>
        <td>Block Content Normal Direction</td>
    </tr>
    <tr>
        <td>15,25,35</td>
        <td>Block Content Position</td>
    </tr>
    <tr>
        <td>16</td>
        <td>Block Content Scale</td>
    </tr>
    <tr>
        <td>46</td>
        <td>Block Content Rotation</td>
    </tr>
    <tr>
        <td>93</td>
        <td>Block Content Color</td>
    </tr>
    <tr>
        <td>47</td>
        <td>Block Transformation Matrix</td>
    </tr>
    <tr>
        <td>110</td>
        <td>MLeader Plane Origin Point</td>
    </tr>
    <tr>
        <td>111</td>
        <td>MLeader Plane X-Axis Direction</td>
    </tr>
    <tr>
        <td>112</td>
        <td>MLeader Plane Y-Axis Direction</td>
    </tr>
    <tr>
        <td>297</td>
        <td>MLeader Plane Normal Reversed</td>
    </tr>
    <tr>
        <td>10,20,30</td>
        <td>Vertex</td>
    </tr>
    <tr>
        <td>90</td>
        <td>Break Point Index</td>
    </tr>
    <tr>
        <td>43</td>
        <td>Text Width</td>
    </tr>
    <tr>
        <td>44</td>
        <td>Text Height</td>
    </tr>
    <tr>
        <td>45</td>
        <td>Text Line Spacing Factor</td>
    </tr>
    <tr>
        <td>170</td>
        <td>Text Line Spacing Style</td>
    </tr>
    <tr>
        <td>90</td>
        <td>Text Color</td>
    </tr>
    <tr>
        <td>171</td>
        <td>Text Attachment</td>
    </tr>
</table>
```

# MLeader Context Data group codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>172</td>
        <td>Text Flow Direction</td>
    </tr>
    <tr>
        <td>91</td>
        <td>Text Background Color</td>
    </tr>
    <tr>
        <td>141</td>
        <td>Text Background Scale Factor</td>
    </tr>
    <tr>
        <td>92</td>
        <td>Text Background Transparency</td>
    </tr>
    <tr>
        <td>291</td>
        <td>Is Text Background Color On</td>
    </tr>
    <tr>
        <td>292</td>
        <td>Is Text Background Fill On</td>
    </tr>
    <tr>
        <td>173</td>
        <td>Text Column Type</td>
    </tr>
    <tr>
        <td>293</td>
        <td>Use Text Auto Height</td>
    </tr>
    <tr>
        <td>142</td>
        <td>Text Column Width</td>
    </tr>
    <tr>
        <td>143</td>
        <td>Text Column Gutter Width</td>
    </tr>
    <tr>
        <td>294</td>
        <td>Text Column Flow Reversed</td>
    </tr>
    <tr>
        <td>144</td>
        <td>Text Column Height</td>
    </tr>
    <tr>
        <td>295</td>
        <td>Text Use Word Break</td>
    </tr>
    <tr>
        <td>296</td>
        <td>HasBlock</td>
    </tr>
    <tr>
        <td>341</td>
        <td>Block Content ID</td>
    </tr>
    <tr>
        <td>14,24,34</td>
        <td>Block Content Normal Direction</td>
    </tr>
    <tr>
        <td>15,25,35</td>
        <td>Block Content Position</td>
    </tr>
    <tr>
        <td>16</td>
        <td>Block Content Scale</td>
    </tr>
    <tr>
        <td>46</td>
        <td>Block Content Rotation</td>
    </tr>
    <tr>
        <td>93</td>
        <td>BBlock Content Color</td>
    </tr>
    <tr><td colspan="2">MLeader Context Data group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>47</td>
        <td>BLock Transformation Matrix</td>
    </tr>
    <tr>
        <td>110</td>
        <td>Mleader Plane Origin Point</td>
    </tr>
    <tr>
        <td>111</td>
        <td>MLeader Plane X-Axis Direction</td>
    </tr>
    <tr>
        <td>112</td>
        <td>MLeader Plane Y-Axis Direction</td>
    </tr>
    <tr>
        <td>297</td>
        <td>MLeader Plane Normal Reversed</td>
    </tr>
</table>
```

# MLeader Leader Node Group Codes

The following group codes apply to all mleader entity types' leader node. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">MLeader Leader Node Group Codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>290</td>
        <td>Has Set Last Leader Line Point</td>
    </tr>
    <tr>
        <td>291</td>
        <td>Has Set Dogleg Vector</td>
    </tr>
    <tr>
        <td>10,20,30</td>
        <td>Last Leader Line Point</td>
    </tr>
    <tr>
        <td>11,21,31</td>
        <td>Dogleg Vector</td>
    </tr>
    <tr>
        <td>12,22,32</td>
        <td>Break Start Point</td>
    </tr>
    <tr>
        <td>13,23,33</td>
        <td>Break End Point</td>
    </tr>
    <tr>
        <td>90</td>
        <td>Leader Branch Index</td>
    </tr>
    <tr>
        <td>40</td>
        <td>Dogleg Length</td>
    </tr>
</table>
```

# MLeader Leader Line Group Codes

The following group codes apply to all mleader entity types' leader line. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Leader Line Group Codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>10,20,30</td>
        <td>Vertex</td>
    </tr>
    <tr>
        <td>90</td>
        <td>Break Point Index</td>
    </tr>
    <tr>
        <td>11,21,31</td>
        <td>Break Start Point</td>
    </tr>
    <tr>
        <td>12,22,32</td>
        <td>Break End Point</td>
    </tr>
    <tr>
        <td>91</td>
        <td>Leader Line Index</td>
    </tr>
</table>
```

# MTEXT

The following group codes apply to mtext entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Mtext group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbMText)</td>
    </tr>
    <tr>
        <td>10</td>
        <td>Insertion point DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>20, 30</td>
        <td>DXF: Y and Z values of insertion point</td>
    </tr>
    <tr>
        <td>40</td>
        <td>Nominal (initial) text height</td>
    </tr>
    <tr>
        <td>41</td>
        <td>Reference rectangle width</td>
    </tr>
    <tr>
        <td>71</td>
        <td>Attachment point:</td>
    </tr>
</table>
```

# Mtext group codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td></td>
        <td>
            1 = Top left; 2 = Top center; 3 = Top right4 = Middle left; 5 = Middle center; 6 = Middle right7 = Bottom
            left; 8 = Bottom center; 9 = Bottom right
        </td>
    </tr>
    <tr>
        <td>72</td>
        <td>
            Drawing direction:1 = Left to right3 = Top to bottom5 = By style (the flow direction is inherited from the
            associated text style)
        </td>
    </tr>
    <tr>
        <td>1</td>
        <td>
            Text string. If the text string is less than 250 characters, all characters appear in group 1. If thetext
            string is greater than 250 characters, the string is divided into 250-character chunks, whichappear in one
            or more group 3 codes. If group 3 codes are used, the last group is a group 1and has fewer than 250
            characters
        </td>
    </tr>
    <tr>
        <td>3</td>
        <td>Additional text (always in 250-character chunks) (optional)</td>
    </tr>
    <tr>
        <td>7</td>
        <td>Text style name (STANDARD if not provided) (optional)</td>
    </tr>
    <tr>
        <td>210</td>
        <td>Extrusion direction (optional; default = 0, 0, 1)DXF: X value; APP: 3D vector</td>
    </tr>
    <tr>
        <td>220, 230</td>
        <td>DXF: Y and Z values of extrusion direction (optional)</td>
    </tr>
    <tr>
        <td>11</td>
        <td>
            X-axis direction vector (in WCS)DXF: X value; APP: 3D vectorA group code 50 (rotation angle in radians)
            passed as DXF input is converted to the equivalentdirection vector (if both a code 50 and codes 11, 21, 31
            are passed, the last one wins). This isprovided as a convenience for conversions from text objects
        </td>
    </tr>
    <tr>
        <td>21, 31</td>
        <td>DXF: Y and Z values of X-axis direction vector (in WCS)</td>
    </tr>
    <tr>
        <td>42</td>
        <td>
            Horizontal width of the characters that make up the mtext entity. This value will always beequal to or less
            than the value of group code 41 (read-only, ignored if supplied)
        </td>
    </tr>
    <tr>
        <td>43</td>
        <td>Vertical height of the mtext entity (read-only, ignored if supplied)</td>
    </tr>
    <tr>
        <td>50</td>
        <td>Rotation angle in radians</td>
    </tr>
    <tr>
        <td>73</td>
        <td>Mtext line spacing style (optional):1 = At least (taller characters will override)</td>
    </tr>
</table>
```

Mtext group codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td></td>
        <td>2 = Exact (taller characters will not override)</td>
    </tr>
    <tr>
        <td>44</td>
        <td>
            Mtext line spacing factor (optional): Percentage of default (3-on-5) line spacing to be applied. Valid
            values range from 0.25 to 4.00
        </td>
    </tr>
    <tr>
        <td>90</td>
        <td>
            Background fill setting: 0 = Background fill off 1 = Use background fill color 2 = Use drawing window color
            as background fill color
        </td>
    </tr>
    <tr>
        <td>420 - 429</td>
        <td>Background color (if RGB color)</td>
    </tr>
    <tr>
        <td>430 - 439</td>
        <td>Background color (if color name)</td>
    </tr>
    <tr>
        <td>45</td>
        <td>Fill box scale (optional): Determines how much border there is around the text.</td>
    </tr>
    <tr>
        <td>63</td>
        <td>Background fill color (optional): Color to use for background fill when group code 90 is 1.</td>
    </tr>
    <tr>
        <td>441</td>
        <td>Transparency of background fill color (not implemented)</td>
    </tr>
    <tr>
        <td>75</td>
        <td>Column type</td>
    </tr>
    <tr>
        <td>76</td>
        <td>Column count</td>
    </tr>
    <tr>
        <td>78</td>
        <td>Column Flow Reversed</td>
    </tr>
    <tr>
        <td>79</td>
        <td>Column Autoheight</td>
    </tr>
    <tr>
        <td>48</td>
        <td>Column width</td>
    </tr>
    <tr>
        <td>49</td>
        <td>Column gutter</td>
    </tr>
    <tr>
        <td>50</td>
        <td>Column heights; this code is followed by a column count (Int16), and then the number of column heights</td>
    </tr>
</table>
```

Xdata with the "DCO15" application ID may follow an mtext entity. This contains information related to the dbConnect feature.

# OLEFRAME

The following group codes apply to oleframe entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Oleframe group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbOleFrame)</td>
    </tr>
    <tr>
        <td>70</td>
        <td>OLE version number</td>
    </tr>
    <tr>
        <td>90</td>
        <td>Length of binary data</td>
    </tr>
    <tr>
        <td>310</td>
        <td>Binary data (multiple lines)</td>
    </tr>
    <tr>
        <td>1</td>
        <td>End of OLE data (the string “OLE”)</td>
    </tr>
</table>
```

# OLE2FRAME

The following group codes apply to ole2frame entities. This information is read-only. During OPEN, the values are ignored because they are part of the OLE binary object, and are obtained by access functions. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Ole2frame group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbOle2Frame)</td>
    </tr>
    <tr>
        <td>70</td>
        <td>OLE version number</td>
    </tr>
    <tr>
        <td>3</td>
        <td>Length of binary data</td>
    </tr>
    <tr>
        <td>10</td>
        <td>Upper-left corner (WCS) DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>20, 30</td>
        <td>DXF: Y and Z values of upper-left corner (in WCS)</td>
    </tr>
    <tr>
        <td>11</td>
        <td>Lower-right corner (WCS)DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>21, 31</td>
        <td>DXF: Y and Z values of lower-right corner (in WCS)</td>
    </tr>
    <tr>
        <td>71</td>
        <td>OLE object type, 1 = Link; 2 = Embedded; 3 = Static</td>
    </tr>
    <tr>
        <td>72</td>
        <td>Tile mode descriptor:0 = Object resides in model space1 = Object resides in paper space</td>
    </tr>
    <tr>
        <td>90</td>
        <td>Length of binary data</td>
    </tr>
    <tr>
        <td>310</td>
        <td>Binary data (multiple lines)</td>
    </tr>
    <tr>
        <td>1</td>
        <td>End of OLE data (the string “OLE”)</td>
    </tr>
</table>
```

Sample DXF output:

```txt
OLE2FRAME
5
2D
100
AcDbEntity
67
1
8
0
100
AcDbOle2Frame
70
2
3
Paintbrush Picture
10
4.43116
20
5.665992
30
0.0
11
6.4188
21
4.244939
31
0.0
71
2
72
1
90
23680
310
0155764BD60082B91140114B08C8F9A91640000000000000506DC0D9AC194002303E5CD1FA
310
1940114B08C8F9A91640000000000000506DC0D9AC194002303E5CD1FA
310
10400000000000000764BD60082B9114002303E5CD1FA104000000000000
...
```

AutoLISP entnext function sample output:

```txt
Command: (setq e (entget e3))
((-1 . <Entity name: 7d50428>) (0 . "OLE2FRAME") (5 . "2D")
(100 . "AcDbEntity") (67 . 1) (8 . "0") (100 . "AcDbOle2Frame")
(70 . 2) (3 "Paintbrush Picture") (10 4.43116 5.66599 0.0)
(11 6.4188 4.24494 0.0) (71 . 2) (72 . 1))
```

# POINT

The following group codes apply to point entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Point group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbPoint)</td>
    </tr>
    <tr>
        <td>10</td>
        <td>Point location (in WCS) DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>20, 30</td>
        <td>DXF: Y and Z values of point location (in WCS)</td>
    </tr>
    <tr>
        <td>39</td>
        <td>Thickness (optional; default = 0)</td>
    </tr>
    <tr>
        <td>210</td>
        <td>Extrusion direction (optional; default = 0, 0, 1) DXF: X value; APP: 3D vector</td>
    </tr>
    <tr>
        <td>220, 230</td>
        <td>DXF: Y and Z values of extrusion direction (optional)</td>
    </tr>
    <tr>
        <td>50</td>
        <td>
            Angle of the X axis for the UCS in effect when the point was drawn (optional, default = 0); used when PDMODE
            is nonzero
        </td>
    </tr>
</table>
```

# POLYLINE

The following group codes apply to polyline entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For

information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Polyline group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDb2dPolyline or AcDb3dPolyline)</td>
    </tr>
    <tr>
        <td>66</td>
        <td>Obsolete; formerly an “entities follow flag” (optional; ignore if present)</td>
    </tr>
    <tr>
        <td>10</td>
        <td>
            DXF: always 0 APP: a “dummy” point; the X and Y values are always 0, and the Z value is the polyline&#x27;s
            elevation (in OCS when 2D, WCS when 3D)
        </td>
    </tr>
    <tr>
        <td>20</td>
        <td>DXF: always 0</td>
    </tr>
    <tr>
        <td>30</td>
        <td>DXF: polyline&#x27;s elevation (in OCS when 2D; WCS when 3D)</td>
    </tr>
    <tr>
        <td>39</td>
        <td>Thickness (optional; default = 0)</td>
    </tr>
    <tr>
        <td>70</td>
        <td>
            Polyline flag (bit-coded; default = 0): 1 = This is a closed polyline (or a polygon mesh closed in the M
            direction) 2 = Curve-fit vertices have been added 4 = Spline-fit vertices have been added 8 = This is a 3D
            polyline 16 = This is a 3D polygon mesh 32 = The polygon mesh is closed in the N direction 64 = The polyline
            is a polyface mesh 128 = The linetype pattern is generated continuously around the vertices of this polyline
        </td>
    </tr>
    <tr>
        <td>40</td>
        <td>Default start width (optional; default = 0)</td>
    </tr>
    <tr>
        <td>41</td>
        <td>Default end width (optional; default = 0)</td>
    </tr>
    <tr>
        <td>71</td>
        <td>Polygon mesh M vertex count (optional; default = 0)</td>
    </tr>
    <tr>
        <td>72</td>
        <td>Polygon mesh N vertex count (optional; default = 0)</td>
    </tr>
    <tr>
        <td>73</td>
        <td>Smooth surface M density (optional; default = 0)</td>
    </tr>
    <tr>
        <td>74</td>
        <td>Smooth surface N density (optional; default = 0)</td>
    </tr>
    <tr>
        <td>75</td>
        <td>Curves and smooth surface type (optional; default = 0); integer codes, not bit-coded:</td>
    </tr>
</table>
```

Polyline group codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td></td>
        <td>0 = No smooth surface fitted</td>
    </tr>
    <tr>
        <td></td>
        <td>5 = Quadratic B-spline surface</td>
    </tr>
    <tr>
        <td></td>
        <td>6 = Cubic B-spline surface</td>
    </tr>
    <tr>
        <td></td>
        <td>8 = Bezier surface</td>
    </tr>
    <tr>
        <td>210</td>
        <td>Extrusion direction (optional; default = 0, 0, 1)</td>
    </tr>
    <tr>
        <td></td>
        <td>DXF: X value; APP: 3D vector</td>
    </tr>
    <tr>
        <td>220, 230</td>
        <td>DXF: Y and Z values of extrusion direction (optional)</td>
    </tr>
</table>
```

Xdata with the "AUTOCAD_POSTSCRIPT_figure" application ID may follow a polyline entity. This contains information related to PostScript images and PostScript fill information.

# Polyface Meshes

A polyface mesh is represented in DXF as a variant of a polyline entity. The polyline header is identified as introducing a polyface mesh by the presence of the 64 bit in the polyline flags (70) group. The 71 group specifies the number of vertices in the mesh, and the 72 group specifies the number of faces. Although these counts are correct for all meshes created with the PFACE command, applications are not required to place correct values in these fields. Following the polyline header is a sequence of vertex entities that specify the vertex coordinates, followed by faces that compose the mesh.

The AutoCAD entity structure imposes a limit on the number of vertices that a given face entity can specify. You can represent more complex polygons by decomposing them into triangular wedges. Their edges should be made invisible to prevent visible artifacts of this subdivision from being drawn. The PFACE command performs this subdivision automatically, but when applications generate polyface meshes directly, the applications must do this themselves. The number of vertices per face is the key parameter in this subdivision process. The PFACEVMAX system variable provides an application with the number of vertices per face entity. This value is read-only and is set to 4.

Polyface meshes created with the PFACE command are always generated with all the vertex coordinate entities first, followed by the face definition entities. The code within AutoCAD that processes polyface meshes requires this ordering. Programs that generate polyface meshes in DXF should generate all

the vertices, and then all the faces. However, programs that read polyfacemeshes from DXF should be tolerant of odd vertex and face ordering.

# RAY

The following group codes apply to ray entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Ray group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbRay)</td>
    </tr>
    <tr>
        <td>10</td>
        <td>Start point (in WCS) DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>20, 30</td>
        <td>DXF: Y and Z values of start point (in WCS)</td>
    </tr>
    <tr>
        <td>11</td>
        <td>Unit direction vector (in WCS) DXF: X value; APP: 3D vector</td>
    </tr>
    <tr>
        <td>21, 31</td>
        <td>DXF: Y and Z values of unit direction vector (in WCS)</td>
    </tr>
</table>
```

# REGION

The following group codes apply to region entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Region group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbModelerGeometry)</td>
    </tr>
    <tr>
        <td>70</td>
        <td>Modeler format version number (currently = 1)</td>
    </tr>
    <tr>
        <td>1</td>
        <td>Proprietary data (multiple lines &lt; 255 characters each)</td>
    </tr>
</table>
```

# Region group codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>3</td>
        <td>
            Additional lines of proprietary data (if previous group 1 string is greater than 255 characters) (optional)
        </td>
    </tr>
</table>
```

# SECTION

The following group codes apply to section entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

# Section group codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbSection)</td>
    </tr>
    <tr>
        <td>90</td>
        <td>Section state</td>
    </tr>
    <tr>
        <td>91</td>
        <td>Section flags</td>
    </tr>
    <tr>
        <td>1</td>
        <td>Name</td>
    </tr>
    <tr>
        <td>10, 20, 30</td>
        <td>Vertical direction</td>
    </tr>
    <tr>
        <td>40</td>
        <td>Top height</td>
    </tr>
    <tr>
        <td>41</td>
        <td>Bottom height</td>
    </tr>
    <tr>
        <td>70</td>
        <td>Indicator transparency</td>
    </tr>
    <tr>
        <td>63, 411</td>
        <td>Indicator color</td>
    </tr>
    <tr>
        <td>92</td>
        <td>Number of vertices</td>
    </tr>
    <tr>
        <td>11, 21, 31</td>
        <td>Vertex (repeats for number of vertices)</td>
    </tr>
    <tr>
        <td>93</td>
        <td>Number of back line vertices</td>
    </tr>
    <tr>
        <td>12, 22, 32</td>
        <td>Back line vertex (repeats for number of back line vertices)</td>
    </tr>
    <tr><td colspan="2">Section group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>360</td>
        <td>Hard-pointer ID/handle to geometry settings object</td>
    </tr>
</table>
```

# SEQEND

The following group codes apply to seqend entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Seqend group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>-2</td>
        <td>
            APP: name of entity that began the sequence. This entity marks the end of vertex (vertex type name) for a
            polyline, or the end of attribute entities (attrib type name) for an insert entity that has attributes
            (indicated by 66 group present and nonzero in insert entity). This code is not saved in a DXF file
        </td>
    </tr>
</table>
```

# SHAPE

The following group codes apply to shape entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Shape group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbShape)</td>
    </tr>
    <tr>
        <td>39</td>
        <td>Thickness (optional; default = 0)</td>
    </tr>
    <tr>
        <td>10</td>
        <td>Insertion point (in WCS) DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>20, 30</td>
        <td>DXF: Y and Z values of insertion point (in WCS)</td>
    </tr>
    <tr>
        <td>40</td>
        <td>Size</td>
    </tr>
</table>
```

Shape group codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>2</td>
        <td>Shape name</td>
    </tr>
    <tr>
        <td>50</td>
        <td>Rotation angle (optional; default = 0)</td>
    </tr>
    <tr>
        <td>41</td>
        <td>Relative X scale factor (optional; default = 1)</td>
    </tr>
    <tr>
        <td>51</td>
        <td>Oblique angle (optional; default = 0)</td>
    </tr>
    <tr>
        <td>210</td>
        <td>Extrusion direction (optional; default = 0, 0, 1) DXF: X value; APP: 3D vector</td>
    </tr>
    <tr>
        <td>220, 230</td>
        <td>DXF: Y and Z values of extrusion direction (optional)</td>
    </tr>
</table>
```

# SOLID

The following group codes apply to solid entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

Solid group codes

```html
<table>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbTrace)</td>
    </tr>
    <tr>
        <td>10</td>
        <td>First corner DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>20, 30</td>
        <td>DXF: Y and Z values of first corner</td>
    </tr>
    <tr>
        <td>11</td>
        <td>Second corner DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>21, 31</td>
        <td>DXF: Y and Z values of second corner</td>
    </tr>
    <tr>
        <td>12</td>
        <td>Third corner XF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>22, 32</td>
        <td>DXF: Y and Z values of third corner</td>
    </tr>
    <tr><td colspan="2">Solid group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>13</td>
        <td>
            Fourth corner. If only three corners are entered to define the SOLID, then the fourth corner coordinate is
            the same as the third. DXF: X value; APP: 3D point
        </td>
    </tr>
    <tr>
        <td>23, 33</td>
        <td>DXF: Y and Z values of fourth corner</td>
    </tr>
    <tr>
        <td>39</td>
        <td>Thickness (optional; default = 0)</td>
    </tr>
    <tr>
        <td>210</td>
        <td>Extrusion direction (optional; default = 0, 0, 1) DXF: X value; APP: 3D vector</td>
    </tr>
    <tr>
        <td>220, 230</td>
        <td>DXF: Y and Z values of extrusion direction (optional)</td>
    </tr>
</table>
```

# SPLINE

The following group codes apply to spline entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Spline group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbSpline)</td>
    </tr>
    <tr>
        <td>210</td>
        <td>Normal vector (omitted if the spline is nonplanar) DXF: X value; APP: 3D vector</td>
    </tr>
    <tr>
        <td>220, 230</td>
        <td>DXF: Y and Z values of normal vector (optional)</td>
    </tr>
    <tr>
        <td>70</td>
        <td>
            Spline flag (bit coded): 1 = Closed spline 2 = Periodic spline 4 = Rational spline 8 = Planar 16 = Linear
            (planar bit is also set)
        </td>
    </tr>
    <tr>
        <td>71</td>
        <td>Degree of the spline curve</td>
    </tr>
    <tr>
        <td>72</td>
        <td>Number of knots</td>
    </tr>
    <tr>
        <td>73</td>
        <td>Number of control points</td>
    </tr>
    <tr>
        <td>74</td>
        <td>Number of fit points (if any)</td>
    </tr>
    <tr>
        <td>42</td>
        <td>Knot tolerance (default = 0.0000001)</td>
    </tr>
    <tr>
        <td>43</td>
        <td>Control-point tolerance (default = 0.0000001)</td>
    </tr>
    <tr>
        <td>44</td>
        <td>Fit tolerance (default = 0.0000000001)</td>
    </tr>
    <tr>
        <td>12</td>
        <td>Start tangent—may be omitted (in WCS) DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>22, 32</td>
        <td>DXF: Y and Z values of start tangent—may be omitted (in WCS)</td>
    </tr>
    <tr>
        <td>13</td>
        <td>End tangent—may be omitted (in WCS) DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>23, 33</td>
        <td>DXF: Y and Z values of end tangent—may be omitted (in WCS)</td>
    </tr>
    <tr>
        <td>40</td>
        <td>Knot value (one entry per knot)</td>
    </tr>
    <tr>
        <td>41</td>
        <td>Weight (if not 1); with multiple group pairs, they are present if all are not 1</td>
    </tr>
    <tr>
        <td>10</td>
        <td>Control points (in WCS); one entry per control point DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>20, 30</td>
        <td>DXF: Y and Z values of control points (in WCS); one entry per control point</td>
    </tr>
    <tr>
        <td>11</td>
        <td>Fit points (in WCS); one entry per fit point DXF: X value; APP: 3D point</td>
    </tr>
    <tr>
        <td>21, 31</td>
        <td>DXF: Y and Z values of fit points (in WCS); one entry per fit point</td>
    </tr>
</table>
```

# SUN

The following group codes apply to the sun entity. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Sun group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbSun)</td>
    </tr>
    <tr>
        <td>90</td>
        <td>Version number</td>
    </tr>
    <tr>
        <td>290</td>
        <td>Status</td>
    </tr>
    <tr>
        <td>63</td>
        <td>Color</td>
    </tr>
    <tr>
        <td>40</td>
        <td>Intensity</td>
    </tr>
    <tr>
        <td>291</td>
        <td>Shadows</td>
    </tr>
    <tr>
        <td>91</td>
        <td>Julian day</td>
    </tr>
    <tr>
        <td>92</td>
        <td>Time (in seconds past midnight)</td>
    </tr>
    <tr>
        <td>292</td>
        <td>Daylight savings time</td>
    </tr>
    <tr>
        <td>70</td>
        <td>Shadow type 0 = Ray traced shadows 1 = Shadow maps</td>
    </tr>
    <tr>
        <td>71</td>
        <td>Shadow map size</td>
    </tr>
    <tr>
        <td>280</td>
        <td>Shadow softness</td>
    </tr>
</table>
```

# SURFACE

Surface entity definitions consist of group codes that are common to all surface types, followed by codes specific to the type.

```html
<table>
    <tr><td colspan="2">Common Surface group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbModelerGeometry)</td>
    </tr>
    <tr>
        <td>70</td>
        <td>Modeler format version number (currently = 1)</td>
    </tr>
    <tr>
        <td>1</td>
        <td>Proprietary data (multiple lines &lt; 255 characters each)</td>
    </tr>
    <tr>
        <td>3</td>
        <td>
            Additional lines of proprietary data (if previous group 1 string is greater than 255 characters) (optional)
        </td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbSurface)</td>
    </tr>
    <tr>
        <td>71</td>
        <td>Number of U isolines</td>
    </tr>
    <tr>
        <td>72</td>
        <td>Number of V isolines</td>
    </tr>
</table>
```

# Extruded Surface

The following group codes apply to extruded surfaces. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Extruded Surface group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbExtrudedSurface)</td>
    </tr>
    <tr>
        <td>90</td>
        <td>Class ID</td>
    </tr>
    <tr>
        <td>90</td>
        <td>Size of binary data</td>
    </tr>
    <tr>
        <td>310</td>
        <td>Binary data</td>
    </tr>
    <tr>
        <td>10, 20, 30</td>
        <td>Sweep vector</td>
    </tr>
    <tr>
        <td>40</td>
        <td>Transform matrix of extruded entity (16 reals; row major format; default = identity matrix)</td>
    </tr>
    <tr>
        <td>42</td>
        <td>Draft angle (in radians)</td>
    </tr>
    <tr>
        <td>43</td>
        <td>Draft start distance</td>
    </tr>
    <tr>
        <td>44</td>
        <td>Draft end distance</td>
    </tr>
    <tr>
        <td>45</td>
        <td>Twist angle</td>
    </tr>
    <tr>
        <td>48</td>
        <td>Scale factor</td>
    </tr>
    <tr>
        <td>49</td>
        <td>Align angle (in radians)</td>
    </tr>
    <tr>
        <td>46</td>
        <td>Transform matrix of sweep entity (16 reals; row major format; default = identity matrix)</td>
    </tr>
    <tr>
        <td>47</td>
        <td>Transform matrix of path entity (16 reals; row major format; default = identity matrix)</td>
    </tr>
    <tr>
        <td>290</td>
        <td>Solid flag</td>
    </tr>
    <tr>
        <td>70</td>
        <td>
            Sweep alignment option 0 = No alignment 1 = Align sweep entity to path 2 = Translate sweep entity to path 3
            = Translate path to sweep entity
        </td>
    </tr>
    <tr>
        <td>292</td>
        <td>Align start flag</td>
    </tr>
    <tr>
        <td>293</td>
        <td>Bank flag</td>
    </tr>
    <tr>
        <td>294</td>
        <td>Base point set flag</td>
    </tr>
    <tr>
        <td>295</td>
        <td>Sweep entity transform computed flag</td>
    </tr>
    <tr>
        <td>296</td>
        <td>Path entity transform computed flag</td>
    </tr>
    <tr>
        <td>11, 21, 31</td>
        <td>Reference vector for controlling twist</td>
    </tr>
</table>
```

# Lofted Surface

The following group codes apply to lofted surfaces. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Lofted Surface group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbLoftedSurface)</td>
    </tr>
    <tr>
        <td>40</td>
        <td>Transform matrix of loft entity (16 reals; row major format; default = identity matrix)</td>
    </tr>
    <tr>
        <td></td>
        <td>Entity data for cross sections</td>
    </tr>
    <tr>
        <td></td>
        <td>Entity data for guide curves</td>
    </tr>
    <tr>
        <td></td>
        <td>Entity data for path curves</td>
    </tr>
    <tr>
        <td>70</td>
        <td>Plane normal lofting type</td>
    </tr>
    <tr>
        <td>41</td>
        <td>Start draft angle (in radians)</td>
    </tr>
    <tr>
        <td>42</td>
        <td>End draft angle (in radians)</td>
    </tr>
    <tr>
        <td>43</td>
        <td>Start draft magnitude</td>
    </tr>
    <tr>
        <td>44</td>
        <td>End draft magnitude</td>
    </tr>
    <tr>
        <td>290</td>
        <td>Arc length parametrization flag</td>
    </tr>
    <tr>
        <td>291</td>
        <td>No twist flag</td>
    </tr>
    <tr>
        <td>292</td>
        <td>Align direction flag</td>
    </tr>
    <tr>
        <td>293</td>
        <td>Create simple surfaces flag</td>
    </tr>
    <tr>
        <td>294</td>
        <td>Create closed surface flag</td>
    </tr>
    <tr>
        <td>295</td>
        <td>Solid flag</td>
    </tr>
    <tr>
        <td>296</td>
        <td>Create ruled surface flag</td>
    </tr>
    <tr>
        <td>297</td>
        <td>Virtual guide flag</td>
    </tr>
</table>
```

# Revolved Surface

The following group codes apply to revolved surfaces. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

```html
<table>
    <tr><td colspan="2">Revolved Surface group codes</td></tr>
    <tr>
        <td>Group code</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>100</td>
        <td>Subclass marker (AcDbRevolvedSurface)</td>
    </tr>
    <tr>
        <td>90</td>
        <td>ID of revolve entity</td>
    </tr>
    <tr>
        <td>90</td>
        <td>Size of binary data</td>
    </tr>
    <tr>
        <td>310</td>
        <td>Binary data</td>
    </tr>
    <tr>
        <td>10, 20, 30</td>
        <td>Axis point</td>
    </tr>
    <tr>
        <td>11, 21, 31</td>
        <td>Axis vector</td>
    </tr>
    <tr>
        <td>40</td>
        <td>Revolve angle (in radians)</td>
    </tr>
    <tr>
        <td>41</td>
        <td>Start angle (in radians)</td>
    </tr>
    <tr>
        <td>42</td>
        <td>Transform matrix of revolved entity (16 reals; row major format; default = identity matrix)</td>
    </tr>
    <tr>
        <td>43</td>
        <td>Draft angle (in radians)</td>
    </tr>
    <tr>
        <td>44</td>
        <td>Start draft distance</td>
    </tr>
    <tr>
        <td>45</td>
        <td>End draft distance</td>
    </tr>
    <tr>
        <td>46</td>
        <td>Twist angle (in radians)</td>
    </tr>
    <tr>
        <td>290</td>
        <td>Solid flag</td>
    </tr>
    <tr>
        <td>291</td>
        <td>Close to axis flag</td>
    </tr>
</table>
```

# Swept Surface

The following group codes apply to swept surfaces. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">Swept Surface group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbSweptSurface)</td></tr><tr><td>90</td><td>ID of sweep entity</td></tr><tr><td>90</td><td>Size of binary data</td></tr><tr><td>310</td><td>Binary data</td></tr><tr><td>90</td><td>ID of path entity</td></tr><tr><td>90</td><td>Size of binary data</td></tr><tr><td>310</td><td>Proprietary data</td></tr><tr><td>40</td><td>Transform matrix of sweep entity (16 reals; row major format; default = identity matrix)</td></tr><tr><td>41</td><td>Transform matrix of path entity (16 reals; row major format; default = identity matrix)</td></tr><tr><td>42</td><td>Draft angle (in radians)</td></tr><tr><td>43</td><td>Draft start distance</td></tr><tr><td>44</td><td>Draft end distance</td></tr><tr><td>45</td><td>Twist angle</td></tr><tr><td>48</td><td>Scale factor</td></tr><tr><td>49</td><td>Align angle (in radians)</td></tr><tr><td>46</td><td>Transform matrix of sweep entity (16 reals; row major format; default = identity matrix)</td></tr><tr><td>47</td><td>Transform matrix of path entity (16 reals; row major format; default = identity matrix)</td></tr><tr><td>290</td><td>Solid flag</td></tr><tr><td>70</td><td>Sweep alignment option
0 = No alignment
1 = Align sweep entity to path
2 = Translate sweep entity to path
3 = Translate path to sweep entity</td></tr><tr><td>292</td><td>Align start flag</td></tr><tr><td>293</td><td>Bank flag</td></tr><tr><td>294</td><td>Base point set flag</td></tr><tr><td>295</td><td>Sweep entity transform computed flag</td></tr><tr><td>296</td><td>Path entity transform computed flag</td></tr><tr><td>11, 21, 31</td><td>Reference vector for controlling twist</td></tr></table>

# TABLE

The following group codes apply to table entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

Table group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Entity name (ACAD_TABLE)</td></tr><tr><td>5</td><td>Entity handle</td></tr></table>

Table group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>330</td><td>Soft-pointer ID to the owner dictionary</td></tr><tr><td>100</td><td>Subclass marker. (AcDbEntity)</td></tr><tr><td>92</td><td>Number of bytes in the proxy entity graphics</td></tr><tr><td>310</td><td>Data for proxy entity graphics (multiple lines; 256-character maximum per line)</td></tr><tr><td>100</td><td>Subclass marker. (AcDbBlockReference)</td></tr><tr><td>2</td><td>Block name; an anonymous block begins with a *T value</td></tr><tr><td>10,20,30</td><td>Insertion point</td></tr><tr><td>100</td><td>Subclass marker. (AcDbTable)</td></tr><tr><td>280</td><td>Table data version number: 0 = 2010</td></tr><tr><td>342</td><td>Hard pointer ID of the TABLESTYLE object</td></tr><tr><td>343</td><td>Hard pointer ID of the owning BLOCK record</td></tr><tr><td>11,21,31</td><td>Horizontal direction vector</td></tr><tr><td>90</td><td>Flag for table value (unsigned integer)</td></tr><tr><td>91</td><td>Number of rows</td></tr><tr><td>92</td><td>Number of columns</td></tr><tr><td>93</td><td>Flag for an override</td></tr><tr><td>94</td><td>Flag for an override of border color</td></tr><tr><td>95</td><td>Flag for an override of border linewidth</td></tr><tr><td>96</td><td>Flag for an override of border visibility</td></tr><tr><td>141</td><td>Row height; this value is repeated, 1 value per row</td></tr><tr><td colspan="2">Table group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>142</td><td>Column height; this value is repeated, 1 value per column</td></tr><tr><td>171</td><td>Cell type; this value is repeated, 1 value per cell:
1 = text type
2 = block type</td></tr><tr><td>172</td><td>Cell flag value; this value is repeated, 1 value per cell</td></tr><tr><td>173</td><td>Cell merged value; this value is repeated, 1 value per cell</td></tr><tr><td>174</td><td>Boolean flag indicating if the autofocus option is set for the cell; this value is repeated, 1 value per cell</td></tr><tr><td>175</td><td>Cell border width (applicable only for merged cells); this value is repeated, 1 value per cell</td></tr><tr><td>176</td><td>Cell border height ( applicable for merged cells); this value is repeated, 1 value per cell</td></tr><tr><td>91</td><td>Cell override flag; this value is repeated, 1 value per cell
(from AutoCAD 2007)</td></tr><tr><td>178</td><td>Flag value for a virtual edge</td></tr><tr><td>145</td><td>Rotation value (real; applicable for a block-type cell and a text-type cell)</td></tr><tr><td>344</td><td>Hard pointer ID of the FIELD object. This applies only to a text-type cell. If the text in the cell contains one or more fields, only the ID of the FIELD object is saved. The text string (group codes 1 and 3) is ignored</td></tr><tr><td>1</td><td>Text string in a cell. If the string is shorter than 250 characters, all characters appear in code 1. If the string is longer than 250 characters, it is divided into chunks of 250 characters. The chunks are contained in one or more code 2 codes. If code 2 codes are used, the last group is a code 1 and is shorter than 250 characters. This value applies only to text-type cells and is repeated, 1 value per cell</td></tr><tr><td>2</td><td>Text string in a cell, in 250-character chunks; optional. This value applies only to text-type cells and is repeated, 1 value per cell</td></tr><tr><td>340</td><td>Hard-pointer ID of the block table record. This value applies only to block-type cells and is re-peated, 1 value per cell</td></tr></table>

Table group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>144</td><td>Block scale (real). This value applies only to block-type cells and is repeated, 1 value per cell</td></tr><tr><td>179</td><td>Number of attribute definitions in the block table record (applicable only to a block-type cell)</td></tr><tr><td>331</td><td>Soft pointer ID of the attribute definition in the block table record, referenced by group code 179 (applicable only for a block-type cell). This value is repeated once per attribute definition</td></tr><tr><td>300</td><td>Text string value for an attribute definition, repeated once per attribute definition and applicable only for a block-type cell</td></tr><tr><td>7</td><td>Text style name (string); override applied at the cell level</td></tr><tr><td>140</td><td>Text height value; override applied at the cell level</td></tr><tr><td>170</td><td>Cell alignment value; override applied at the cell level</td></tr><tr><td>64</td><td>Value for the color of cell content; override applied at the cell level</td></tr><tr><td>63</td><td>Value for the background (fill) color of cell content; override applied at the cell level</td></tr><tr><td>69</td><td>True color value for the top border of the cell; override applied at the cell level</td></tr><tr><td>65</td><td>True color value for the right border of the cell; override applied at the cell level</td></tr><tr><td>66</td><td>True color value for the bottom border of the cell; override applied at the cell level</td></tr><tr><td>68</td><td>True color value for the left border of the cell; override applied at the cell level</td></tr><tr><td>279</td><td>Lineweight for the top border of the cell; override applied at the cell level</td></tr><tr><td>275</td><td>Lineweight for the right border of the cell; override applied at the cell level</td></tr><tr><td>276</td><td>Lineweight for the bottom border of the cell; override applied at the cell level</td></tr><tr><td>278</td><td>Lineweight for the left border of the cell; override applied at the cell level</td></tr><tr><td>283</td><td>Boolean flag for whether the fill color is on; override applied at the cell level</td></tr><tr><td>289</td><td>Boolean flag for the visibility of the top border of the cell; override applied at the cell level</td></tr><tr><td colspan="2">Table group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>285</td><td>Boolean flag for the visibility of the right border of the cell; override applied at the cell level</td></tr><tr><td>286</td><td>Boolean flag for the visibility of the bottom border of the cell; override applied at the cell level</td></tr><tr><td>288</td><td>Boolean flag for the visibility of the left border of the cell; override applied at the cell level</td></tr><tr><td>70</td><td>Flow direction; override applied at the table entity level</td></tr><tr><td>40</td><td>Horizontal cell margin; override applied at the table entity level</td></tr><tr><td>41</td><td>Vertical cell margin; override applied at the table entity level</td></tr><tr><td>280</td><td>Flag for whether the title is suppressed; override applied at the table entity level</td></tr><tr><td>281</td><td>Flag for whether the header row is suppressed; override applied at the table entity level</td></tr><tr><td>7</td><td>Text style name (string); override applied at the table entity level. There may be one entry for each cell type</td></tr><tr><td>140</td><td>Text height (real); override applied at the table entity level. There may be one entry for each cell type</td></tr><tr><td>170</td><td>Cell alignment (integer); override applied at the table entity level. There may be one entry for each cell type</td></tr><tr><td>63</td><td>Color value for cell background or for the vertical, left border of the table; override applied at the table entity level. There may be one entry for each cell type</td></tr><tr><td>64</td><td>Color value for cell content or for the horizontal, top border of the table; override applied at the table entity level. There may be one entry for each cell type</td></tr><tr><td>65</td><td>Color value for the horizontal, inside border lines; override applied at the table entity level</td></tr><tr><td>66</td><td>Color value for the horizontal, bottom border lines; override applied at the table entity level</td></tr><tr><td>68</td><td>Color value for the vertical, inside border lines; override applied at the table entity level</td></tr><tr><td>69</td><td>Color value for the vertical, right border lines; override applied at the table entity level</td></tr></table>

Table group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>283</td><td>Flag for whether background color is enabled (default = 0); override applied at the table entity level. There may be one entry for each cell type:
0 = Disabled
1 = Enabled</td></tr><tr><td>274-279</td><td>Lineweight for each border type of the cell (default = kLnWtByBlock); override applied at the table entity level. There may be one group for each cell type</td></tr><tr><td>284-289</td><td>Flag for visibility of each border type of the cell (default = 1); override applied at the table entity level. There may be one group for each cell type:
0 = Invisible
1 = Visible</td></tr><tr><td>97</td><td>Standard/title/header row data type</td></tr><tr><td>98</td><td>Standard/title/header row unit type</td></tr><tr><td>4</td><td>Standard/title/header row format string</td></tr><tr><td>177</td><td>Cell override flag value (before AutoCAD 2007)</td></tr><tr><td>92</td><td>Extended cell flags (from AutoCAD 2007)</td></tr><tr><td>301</td><td>Cell value block begin (from AutoCAD 2007)</td></tr><tr><td>302</td><td>Text string in a cell. If the string is shorter than 250 characters, all characters appear in code 302. If the string is longer than 250 characters, it is divided into chunks of 250 characters. The chunks are contained in one or more code 303 codes. If code 393 codes are used, the last group is a code 1 and is shorter than 250 characters. This value applies only to text-type cells and is repeated, 1 value per cell (from AutoCAD 2007)</td></tr><tr><td>303</td><td>Text string in a cell, in 250-character chunks; optional. This value applies only to text-type cells and is repeated, 302 value per cell (from AutoCAD 2007)</td></tr></table>

Group code 178 is a flag value for a virtual edge. A virtual edge is used when a grid line is shared by two cells. For example, if a table contains one row and two columns and it contains cell A and cell B, the central grid line contains the right edge of cell A and the left edge of cell B. One edge is real, and the other edge is virtual. The virtual edge points to the real edge; both edges have the same set of properties, including color, lineweight, and visibility.

# TEXT

The following group codes apply to text entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">Text group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbText)</td></tr><tr><td>39</td><td>Thickness (optional; default = 0)</td></tr><tr><td>10</td><td>First alignment point (in OCS)
DXF: X value; APP: 3D point</td></tr><tr><td>20, 30</td><td>DXF: Y and Z values of first alignment point (in OCS)</td></tr><tr><td>40</td><td>Text height</td></tr><tr><td>1</td><td>Default value (the string itself)</td></tr><tr><td>50</td><td>Text rotation (optional; default = 0)</td></tr><tr><td>41</td><td>Relative X scale factor—width (optional; default = 1)
This value is also adjusted when fit-type text is used</td></tr><tr><td>51</td><td>Oblique angle (optional; default = 0)</td></tr><tr><td>7</td><td>Text style name (optional, default = STANDARD)</td></tr><tr><td>71</td><td>Text generation flags (optional, default = 0):
2 = Text is backward (mirrored in X)
4 = Text is upside down (mirrored in Y)</td></tr><tr><td>72</td><td>Horizontal text justification type (optional, default = 0) integer codes (not bit-coded)
0 = Left; 1 = Center; 2 = Right
3 = Aligned (if vertical alignment = 0)
4 = Middle (if vertical alignment = 0)
5 = Fit (if vertical alignment = 0)
See the Group 72 and 73 integer codes table for clarification</td></tr></table>

Text group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>11</td><td>Second alignment point (in OCS) (optional)DXF: X value; APP: 3D pointThis value is meaningful only if the value of a 72 or 73 group is nonzero (if the justification is anything other than baseline/left)</td></tr><tr><td>21, 31</td><td>DXF: Y and Z values of second alignment point (in OCS) (optional)</td></tr><tr><td>210</td><td>Extrusion direction (optional; default = 0, 0, 1)DXF: X value; APP: 3D vector</td></tr><tr><td>220, 230</td><td>DXF: Y and Z values of extrusion direction (optional)</td></tr><tr><td>100</td><td>Subclass marker (AcDbText)</td></tr><tr><td>73</td><td>Vertical text justification type (optional, default = 0): integer codes (not bit-coded):0 = Baseline; 1 = Bottom; 2 = Middle; 3 = TopSee the Group 72 and 73 integer codes table for clarification</td></tr></table>

The following table describes the group codes 72 (horizontal alignment) and 73 (vertical alignment) in greater detail.

<table><tr><td colspan="7">Group 72 and 73 integer codes</td></tr><tr><td>Group 73</td><td>Group 720</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr><tr><td>3 (top)</td><td>TLeft</td><td>TCenter</td><td>TRight</td><td></td><td></td><td></td></tr><tr><td>2 (middle)</td><td>MLeft</td><td>MCenter</td><td>MRight</td><td></td><td></td><td></td></tr><tr><td>1 (bottom)</td><td>BLeft</td><td>BCenter</td><td>BRight</td><td></td><td></td><td></td></tr><tr><td>0 (baseline)</td><td>Left</td><td>Center</td><td>Right</td><td>Aligned</td><td>Middle</td><td>Fit</td></tr></table>

If group 72 and/or 73 values are nonzero then the first alignment point values are ignored and AutoCAD calculates new values based on the second alignment point and the length and height of the text string itself (after applying the text style). If the 72 and 73 values are zero or missing, then the second alignment point is meaningless.

# TOLERANCE

The following group codes apply to tolerance entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">Tolerance group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbFcf)</td></tr><tr><td>3</td><td>Dimension style name</td></tr><tr><td>10</td><td>Insertion point (in WCS)
DXF: X value; APP: 3D point</td></tr><tr><td>20, 30</td><td>DXF: Y and Z values of insertion point (in WCS)</td></tr><tr><td>1</td><td>String representing the visual representation of the tolerance</td></tr><tr><td>210</td><td>Extrusion direction (optional; default = 0, 0, 1)
DXF: X value; APP: 3D vector</td></tr><tr><td>220, 230</td><td>DXF: Y and Z values of extrusion direction (optional)</td></tr><tr><td>11</td><td>X-axis direction vector (in WCS)
DXF: X value; APP: 3D vector</td></tr><tr><td>21, 31</td><td>DXF: Y and Z values of X-axis direction vector (in WCS)</td></tr></table>

# TRACE

The following group codes apply to trace entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">Trace group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbTrace)</td></tr><tr><td>10</td><td>First corner (in OCS)DXF: X value; APP: 3D point</td></tr><tr><td>20, 30</td><td>DXF: Y and Z values of first corner (in OCS)</td></tr><tr><td>11</td><td>Second corner (in OCS)DXF: X value; APP: 3D point</td></tr><tr><td>21, 31</td><td>DXF: Y and Z values of second corner (in OCS)</td></tr><tr><td>12</td><td>Third corner (in OCS)DXF: X value; APP: 3D point</td></tr><tr><td>22, 32</td><td>DXF: Y and Z values of third corner (in OCS)</td></tr><tr><td>13</td><td>Fourth corner (in OCS)DXF: X value; APP: 3D point</td></tr><tr><td>23, 33</td><td>DXF: Y and Z values of fourth corner (in OCS)</td></tr><tr><td>39</td><td>Thickness (optional; default = 0)</td></tr><tr><td>210</td><td>Extrusion direction (optional; default = 0, 0, 1)DXF: X value; APP: 3D vector</td></tr><tr><td>220, 230</td><td>DXF: Y and Z values of extrusion direction (optional)</td></tr></table>

# UNDERLAY

The following group codes apply to underlays. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

Please note that UNDERLAY group codes are common to DWFUNDERLAY and DGNUNDERLAY. The differentiation between DWFUNDERLAY and DGN UNDERLAY occurs in group code 0, defining the object name.

<table><tr><td colspan="2">Underlay group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name. Defined as “DWFUNDERLAY” for DWFUNDERLAY entities, or “DGNUNDERLAY” for DGNUNDERLAY entities.</td></tr><tr><td>100</td><td>Subclass marker (AcDbUnderlayReference)</td></tr><tr><td>340</td><td>The ID of the AcDbUnderlayDefinition object</td></tr><tr><td>10,20,30</td><td>The X,Y, and Z coordinates of the insertion point of the underlay. These are OCS/ECS coordinates</td></tr><tr><td>41,42,43</td><td>DXF: X, Y, and Z scale factors</td></tr><tr><td>50</td><td>Rotation Angle (in OCS/ECS. CCW from the coordinate system X axis and around the Z axis)</td></tr><tr><td>210,220,230</td><td>Normal vector (in WCS)</td></tr><tr><td>280</td><td>Flags
1 = Clipping is on
2 = Underlay is on
4 = Monochrome
8 = Adjust for background
16 = Clip is inside mode</td></tr><tr><td>281</td><td>Contrast (value between 20 and 100)</td></tr><tr><td>282</td><td>Fade (value between 0 and 80)</td></tr><tr><td>11, 21</td><td>Repeating: 2d points in OCS/ECS. If only two, then they are the lower left and upper right corner points of a clip rectangle. If more than two, then they are the vertices of a clipping polygon</td></tr></table>

# VERTEX

The following group codes apply to vertex entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">Vertex group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbVertex)</td></tr><tr><td>100</td><td>Subclass marker (AcDb2dVertex or AcDb3dPolylineVertex)</td></tr><tr><td>10</td><td>Location point (in OCS when 2D, and WCS when 3D)
DXF: X value; APP: 3D point</td></tr><tr><td>20, 30</td><td>DXF: Y and Z values of location point (in OCS when 2D, and WCS when 3D)</td></tr><tr><td>40</td><td>Starting width (optional; default is 0)</td></tr><tr><td>41</td><td>Ending width (optional; default is 0)</td></tr><tr><td>42</td><td>Bulge (optional; default is 0). The bulge is the tangent of one fourth the included angle for an arc segment, made negative if the arc goes clockwise from the start point to the endpoint. A bulge of 0 indicates a straight segment, and a bulge of 1 is a semicircle</td></tr><tr><td>70</td><td>Vertex flags:
1 = Extra vertex created by curve-fitting
2 = Curve-fit tangent defined for this vertex. A curve-fit tangent direction of 0 may be omitted from DXF output but is significant if this bit is set
4 = Not used
8 = Spline vertex created by spline-fitting
16 = Spline frame control point
32 = 3D polyline vertex
64 = 3D polygon mesh
128 = Polyface mesh vertex</td></tr><tr><td>50</td><td>Curve fit tangent direction</td></tr><tr><td>71</td><td>Polyface mesh vertex index (optional; present only if nonzero)</td></tr><tr><td>72</td><td>Polyface mesh vertex index (optional; present only if nonzero)</td></tr><tr><td>73</td><td>Polyface mesh vertex index (optional; present only if nonzero)</td></tr><tr><td>74</td><td>Polyface mesh vertex index (optional; present only if nonzero)</td></tr><tr><td>91</td><td>Vertex identifier</td></tr></table>

Every vertex that is part of a polyface mesh has its vertex flag 128 bit set. If the entity supplies the coordinate of a vertex of the mesh, its 64 bit is set as well, and the 10, 20, 30 groups give the vertex coordinate. The vertex index values are determined by the order in which the vertex entities appear within the polyline, with the first being numbered 1.

If the vertex defines a face of the mesh, its vertex flags group has the 128 bit set but not the 64 bit. In this case, the 10, 20, 30 (location) groups of the face entity are irrelevant and are always written as 0 in a DXF file. The vertex indexes that define the mesh are given by 71, 72, 73, and 74 group codes, the values of which specify one of the previously defined vertexes by index. If the index is negative, the edge that begins with that vertex is invisible. The first 0 vertex marks the end of the vertices of the face.

# VIEWPORT

The following group codes apply to viewport entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">Viewport group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbViewport)</td></tr><tr><td>10</td><td>Center point (in WCS)
DXF: X value; APP: 3D point</td></tr><tr><td>20, 30</td><td>DXF: Y and Z values of center point (in WCS)</td></tr><tr><td>40</td><td>Width in paper space units</td></tr></table>

Viewport group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>41</td><td>Height in paper space units</td></tr><tr><td>68</td><td>Viewport status field:
-1 = On, but is fully off screen, or is one of the viewports that is not active because the $MAX-ACTVP count is currently being exceeded.
0 = Off
&lt;positive value &gt;= On and active. The value indicates the order of stacking for the viewports, where 1 is the active viewpoint, 2 is the next, and so forth</td></tr><tr><td>69</td><td>Viewport ID</td></tr><tr><td>12</td><td>View center point (in DCS)
DXF: X value; APP: 2D point</td></tr><tr><td>22</td><td>DXF: View center point Y value (in DCS)</td></tr><tr><td>13</td><td>Snap base point
DXF: X value; APP: 2D point</td></tr><tr><td>23</td><td>DXF: Snap base point Y value</td></tr><tr><td>14</td><td>Snap spacing
DXF: X value; APP: 2D point</td></tr><tr><td>24</td><td>DXF: Snap spacing Y value</td></tr><tr><td>15</td><td>Grid spacing
DXF: X value; APP: 2D point</td></tr><tr><td>25</td><td>DXF: Grid spacing Y value</td></tr><tr><td>16</td><td>View direction vector (in WCS)
DXF: X value; APP: 3D vector</td></tr><tr><td>26, 36</td><td>DXF: Y and Z values of view direction vector (in WCS)</td></tr><tr><td>17</td><td>View target point (in WCS)
DXF: X value; APP: 3D vector</td></tr><tr><td>27, 37</td><td>DXF: Y and Z values of view target point (in WCS)</td></tr><tr><td colspan="2">Viewport group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>42</td><td>Perspective lens length</td></tr><tr><td>43</td><td>Front clip plane Z value</td></tr><tr><td>44</td><td>Back clip plane Z value</td></tr><tr><td>45</td><td>View height (in model space units)</td></tr><tr><td>50</td><td>Snap angle</td></tr><tr><td>51</td><td>View twist angle</td></tr><tr><td>72</td><td>Circle zoom percent</td></tr><tr><td>331</td><td>Frozen layer object ID/handle (multiple entries may exist) (optional)</td></tr><tr><td>90</td><td>Viewport status bit-coded flags:
1 (0x1) = Enables perspective mode
2 (0x2) = Enables front clipping
4 (0x4) = Enables back clipping
8 (0x8) = Enables UCS follow
16 (0x10) = Enables front clip not at eye
32 (0x20) = Enables UCS icon visibility
64 (0x40) = Enables UCS icon at origin
128 (0x80) = Enables fast zoom
256 (0x100) = Enables snap mode
512 (0x200) = Enables grid mode
1024 (0x400) = Enables isometric snap style
2048 (0x800) = Enables hide plot mode
4096 (0x1000) = klsoPairTop. If set and klsoPairRight is not set, then isopair top is enabled. If both klsoPairTop and klsoPairRight are set, then isopair left is enabled
8192 (0x2000) = klsoPairRight. If set and klsoPairTop is not set, then isopair right is enabled
16384 (0x4000) = Enables viewpoint zoom locking
32768 (0x8000) = Currently always enabled
65536 (0x10000) = Enables non-rectangular clipping
131072 (0x20000) = Turns the viewport off
262144 (0x40000) = Enables the display of the grid beyond the drawing limits
524288 (0x80000) = Enable adaptive grid display
1048576 (0x100000) = Enables subdivision of the grid below the set grid spacing when the grid display is adaptive</td></tr></table>

Viewport group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td></td><td>2097152 (0x200000) = Enables grid follows workplane switching</td></tr><tr><td>340</td><td>Hard-pointer ID/handle to entity that serves as the viewpoint&#x27;s clipping boundary (only present if viewpoint is non-rectangular)</td></tr><tr><td>1</td><td>Plot style sheet name assigned to this viewpoint</td></tr><tr><td>281</td><td>Render mode:0 = 2D Optimized (classic 2D)1 = Wireframe2 = Hidden line3 = Flat shaded4 = Gouraud shaded5 = Flat shaded with wireframe6 = Gouraud shaded with wireframeAll rendering modes other than 2D Optimized engage the new 3D graphics pipeline. These values directly correspond to the SHADEMODE command and the AcDbAbstractViewTableRe-cord::RenderMode enum</td></tr><tr><td>71</td><td>UCS per viewpoint flag:0 = The UCS will not change when this viewpoint becomes active.1 = This viewpoint stores its own UCS which will become the current UCS whenever the viewpoint is activated</td></tr><tr><td>74</td><td>Display UCS icon at UCS origin flag:Controls whether UCS icon represents viewpoint UCS or current UCS (these will be different if UCSVP is 1 and viewpoint is not active). However, this field is currently being ignored and the icon always represents the viewpoint UCS</td></tr><tr><td>110</td><td>UCS originDXF: X value; APP: 3D point</td></tr><tr><td>120, 130</td><td>DXF: Y and Z values of UCS origin</td></tr><tr><td>111</td><td>UCS X-axisDXF: X value; APP: 3D vector</td></tr><tr><td>121, 131</td><td>DXF: Y and Z values of UCS X-axis</td></tr><tr><td>112</td><td>UCS Y-axis</td></tr></table>

Viewport group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td></td><td>DXF: X value; APP: 3D vector</td></tr><tr><td>122, 132</td><td>DXF: Y and Z values of UCS Y-axis</td></tr><tr><td>345</td><td>ID/handle of AcDbUCStableRecord if UCS is a named UCS. If not present, then UCS is unnamed</td></tr><tr><td>346</td><td>ID/handle of AcDbUCStableRecord of base UCS if UCS is orthographic (79 code is non-zero). If not present and 79 code is non-zero, then base UCS is taken to be WORLD</td></tr><tr><td>79</td><td>Orthographic type of UCS:0 = UCS is not orthographic1 = Top; 2 = Bottom3 = Front; 4 = Back5 = Left; 6 = Right</td></tr><tr><td>146</td><td>Elevation</td></tr><tr><td>170</td><td>ShadePlot mode:0 = As Displayed1 = Wireframe2 = Hidden3 = Rendered</td></tr><tr><td>61</td><td>Frequency of major grid lines compared to minor grid lines</td></tr><tr><td>332</td><td>Background ID/Handle (optional)</td></tr><tr><td>333</td><td>Shade plot ID/Handle (optional)</td></tr><tr><td>348</td><td>Visual style ID/Handle (optional)</td></tr><tr><td>292</td><td>Default lighting flag. On when no user lights are specified.</td></tr><tr><td>282</td><td>Default lighting type:0 = One distant light1 = Two distant lights</td></tr><tr><td>141</td><td>View brightness</td></tr><tr><td>142</td><td>View contrast</td></tr></table>

# Viewport group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>63,421,431</td><td>Ambient light color. Write only if not black color.</td></tr><tr><td>361</td><td>Sun ID/Handle (optional)</td></tr><tr><td>335</td><td>Soft pointer reference to viewport object (for layer VP property override)</td></tr><tr><td>343</td><td>Soft pointer reference toviewport object (for layer VP property override)</td></tr><tr><td>344</td><td>Soft pointer reference toviewport object (for layer VP property override)</td></tr><tr><td>91</td><td>Soft pointer reference toviewport object (for layer VP property override)</td></tr></table>

NOTE The ZOOM XP factor is calculated with the following formula: group_41 / group_45 (or pspace_height / mspace_height).

# WIPEOUT

The following group codes apply to wipeout entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

# Wipeout group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbRasterImage)</td></tr><tr><td>90</td><td>Class version</td></tr><tr><td>10</td><td>Insertion point (in WCS)
DXF: X value; APP: 3D point</td></tr><tr><td>20, 30</td><td>DXF: Y and Z values of insertion point (in WCS)</td></tr><tr><td>11</td><td>U-vector of a single pixel (points along the visual bottom of the image, starting at the insertion point) (in WCS)
DXF: X value; APP: 3D point</td></tr><tr><td colspan="2">Wipeout group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>21, 31</td><td>DXF: Y and Z values U-vector (in WCS)</td></tr><tr><td>12</td><td>V-vector of a single pixel (points along the visual left side of the image, starting at the insertion point) (in WCS)
DXF: X value; APP: 3D point</td></tr><tr><td>22, 32</td><td>DXF: Y and Z values of V-vector (in WCS)</td></tr><tr><td>13</td><td>Image size in pixels
DXF: U value; APP: 2D point (U and V values)</td></tr><tr><td>23</td><td>DXF: V value of image size in pixels</td></tr><tr><td>340</td><td>Hard reference to imagedef object</td></tr><tr><td>70</td><td>Image display properties:
1 = Show image
2 = Show image when not aligned with screen
4 = Use clipping boundary
8 = Transparency is on</td></tr><tr><td>280</td><td>Clipping state: 0 = Off; 1 = On</td></tr><tr><td>281</td><td>Brightness value (0-100; default = 50)</td></tr><tr><td>282</td><td>Contrast value (0-100; default = 50)</td></tr><tr><td>283</td><td>Fade value (0-100; default = 0)</td></tr><tr><td>360</td><td>Hard reference to imagedef_reactor object</td></tr><tr><td>71</td><td>Clipping boundary type. 1 = Rectangular; 2 = Polygonal</td></tr><tr><td>91</td><td>Number of clip boundary vertices that follow</td></tr><tr><td>14</td><td>Clip boundary vertex (in OCS)
DXF: X value; APP: 2D point (multiple entries)
NOTE 1) For rectangular clip boundary type, two opposite corners must be specified. Default is (-0.5,-0.5), (size.x-0.5, size.y-0.5). 2) For polygonal clip boundary type, three or more vertices must be specified. Polygonal vertices must be listed sequentially</td></tr><tr><td>24</td><td>DXF: Y value of clip boundary vertex (in OCS) (multiple entries)</td></tr></table>

# XLINE

The following group codes apply to xline entities. In addition to the group codes described here, see Common Group Codes for Entities on page 61. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">Xline group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbXline)</td></tr><tr><td>10</td><td>First point (in WCS)
DXF: X value; APP: 3D point</td></tr><tr><td>20, 30</td><td>DXF: Y and Z values of first point (in WCS)</td></tr><tr><td>11</td><td>Unit direction vector (in WCS)
DXF: X value; APP: 3D vector</td></tr><tr><td>21, 31</td><td>DXF: Y and Z values of unit direction vector (in WCS)</td></tr></table>

# OBJECTS Section

# 7

This chapter presents the group codes that apply to nongraphical objects. These codes are found in the OBJECTS section of a  $\mathrm{DXF}^{\mathrm{TM}}$  file and are used by AutoLISP® and ObjectARX® applications in entity definition lists.

# OBJECT Section Group Codes

Objects are similar to entities, except that they have no graphical or geometric meaning. All objects that are not entities or symbol table records or symbol tables are stored in this section. This section represents a homogeneous heap of objects with topological ordering of objects by ownership, such that the owners always appear before the objects they own.

# Object Ownership

The root owner of most objects appearing in the OBJECTS section is the named object dictionary, which is, therefore, always the first object that appears in this section. Objects that are not owned by the named object dictionary are owned by other entities, objects, or symbol table entries. Objects in this section may be defined by AutoCAD® or by applications with access to ObjectARX® API. The DXF names of application-defined object types should always be associated with a class name in the CLASS section of the DXF file, or else the object record cannot be bound to the application that will interpret it.

As with other dictionaries, the named-object dictionary record consists solely of associated pairs of entry names and hard ownership pointer references to the associated object.

To avoid name collision between objects, developers should always use their registered developer prefix for their entries.

# Common Group Codes for Objects

The following table shows group codes that apply to virtually all nongraphical objects. When you refer to a table of group codes by object type, a list of codes associated with a specific object, keep in mind that the codes shown here can also be present. Some of the group codes are included with an object only if the object has nondefault values for those group code properties. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">Common object group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object type</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of application-defined group “{application_name” (optional)</td></tr><tr><td>application-defined codes</td><td>Codes and values within the 102 groups are application defined (optional)</td></tr><tr><td>102</td><td>End of group, “}” (optional)</td></tr><tr><td>102</td><td>“{ACAD_REACTORS” indicates the start of the AutoCAD persistent reactors group. This group exists only if persistent reactors have been attached to this object (optional)</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary (optional)</td></tr><tr><td>102</td><td>End of group, “}” (optional)</td></tr><tr><td>102</td><td>“{ACAD_XDICTIONARY” indicates the start of an extension dictionary group. This group exists only if persistent reactors have been attached to this object (optional)</td></tr><tr><td>360</td><td>Hard-owner ID/handle to owner dictionary (optional)</td></tr><tr><td>102</td><td>End of group, “}” (optional)</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner object</td></tr></table>

# ACAD_PROXY_OBJECT

The following group codes apply to ACAD_PROXY_OBJECT objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">ACAD_PROXY_OBJECT group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>DXF: Subclass marker (AcDbProxyObject)</td></tr><tr><td>90</td><td>DXF: Proxy object class ID (always 499)</td></tr><tr><td>91</td><td>DXF: Application object&#x27;s class ID. Class IDs are based on the order of the class in the CLASSES section. The first class is given the ID of 500, the next is 501, and so on</td></tr><tr><td>93</td><td>DXF: Size of object data in bits</td></tr><tr><td>310</td><td>DXF: Binary object data (multiple entries can appear) (optional)</td></tr><tr><td>330 or 340 or 350 or 360</td><td>DXF: An object ID (multiple entries can appear) (optional)</td></tr><tr><td>94</td><td>DXF: 0 (indicates end of object ID section)</td></tr><tr><td>95</td><td>DXF: Object drawing format when it becomes a proxy (a 32-bit unsigned integer):
Low word is AcDbDwgVersion
High word is MaintenanceReleaseVersion</td></tr><tr><td>70</td><td>DXF: Original custom object data format:
0 = DWG format
1 = DXF format</td></tr></table>

The 92 field is not used for AcDbProxyObject. Objects of this class never have graphics.

# ACDBDICTIONARYWDFLT

The following group codes are used by ACDBDICTIONARYWDFLT objects. In addition to the group codes described here, see Common Group Codes for

Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">ACDBDCTIONARYWDFLT group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (ACDBDCTIONARYWDFLT)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always “{ACAD_REACTORS”</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary</td></tr><tr><td>102</td><td>End of persistent reactors group, always “}”</td></tr><tr><td>330</td><td>Soft-owner ID/handle to owner object</td></tr><tr><td>100</td><td>Subclass marker (AcDbDictionary)</td></tr><tr><td>281</td><td>Duplicate record cloning flag (determines how to merge duplicate entries):
0 = Not applicable
1 = Keep existing
2 = Use clone
3 = &lt;xref&gt;$0&lt;$name&gt;
4 = $0&lt;$name&gt;
5 = Unmangle name</td></tr><tr><td>3</td><td>Entry name (one for each entry)</td></tr><tr><td>350</td><td>Soft-owner ID/handle to entry object (one for each entry)</td></tr><tr><td>100</td><td>Subclass marker (AcDbDictionaryWithDefault)</td></tr><tr><td>340</td><td>Hard pointer to default object ID/handle (currently only used for plot style dictionary&#x27;s default entry, named “Normal”)</td></tr></table>

# ACDBPLACEHOLDER

The following group codes are used by the ACDBPLACEHOLDER objects. In addition to the group codes described here, see Common Group Codes for

Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">ACDBPLACEHOLDER group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (ACDBPLACEHOLDER)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always &quot;#{ACAD_REACTORS}&quot;</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary</td></tr><tr><td>102</td><td>End of persistent reactors group, always &quot;#&quot;</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner object</td></tr></table>

# DATATABLE

The following group codes are used by the DATATABLE objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">DATATABLE group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (DATATABLE)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always "#{ACAD_REACTORS}"</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary</td></tr><tr><td>102</td><td>End of persistent reactors group, always "#"</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner object</td></tr><tr><td>100</td><td>Subclass marker (AcDbDataTable)</td></tr><tr><td>70</td><td>Version</td></tr><tr><td>90</td><td>Number of columns</td></tr><tr><td>91</td><td>Number of valid rows</td></tr><tr><td>1</td><td>Table name</td></tr><tr><td>92, 2</td><td>Column type and name; repeats for each column</td></tr><tr><td></td><td>One value is written for every row in each column</td></tr><tr><td>71</td><td>Boolean value</td></tr><tr><td>93</td><td>Integer value</td></tr><tr><td>40</td><td>Double value</td></tr><tr><td>3</td><td>String value</td></tr><tr><td>10, 20, 30</td><td>2D Point</td></tr><tr><td>11, 21, 31</td><td>3D Point</td></tr><tr><td>331</td><td>Soft-pointer ID/handle to object value</td></tr><tr><td>360</td><td>Hard-pointer ownership ID</td></tr><tr><td>350</td><td>Soft-pointer ownership ID</td></tr><tr><td>340</td><td>Hard-pointer ID/handle</td></tr><tr><td>330</td><td>Soft-pointer ID/handle</td></tr></table>

# DICTIONARY

The following group codes are used by DICTIONARY objects. In addition to the group codes described here, see Common Group Codes for Objects on

page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">DICTIONARY group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (DICTIONARY)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always “{ACAD_REACTORS}&quot;</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary</td></tr><tr><td>102</td><td>End of persistent reactors group, always “)”</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner object</td></tr><tr><td>100</td><td>Subclass marker (AcDbDictionary)</td></tr><tr><td>280</td><td>Hard-owner flag. If set to 1, indicates that elements of the dictionary are to be treated as hard-owned</td></tr><tr><td>281</td><td>Duplicate record cloning flag (determines how to merge duplicate entries):
0 = Not applicable
1 = Keep existing
2 = Use clone
3 = &lt;xref&gt;$0&lt;$name&gt;
4 = $0&lt;$name&gt;
5 = Unmangle name</td></tr><tr><td>3</td><td>Entry name (one for each entry) (optional)</td></tr><tr><td>350</td><td>Soft-owner ID/handle to entry object (one for each entry) (optional)</td></tr></table>

AutoCAD® maintains items such as mline styles and group definitions as objects in dictionaries. The following sections describe the AutoCAD object group codes maintained in dictionaries; however, other applications are free to create and use their own dictionaries as they see fit. The prefix "ACAD_" is reserved for use by AutoCAD applications.

# DICTIONARYVAR

The following group codes are used by DICTIONARYVAR objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

DICTIONARYVAR group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (DICTIONARYVAR)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always &quot;#{ACAD_REACTORS}&quot;</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary (ACDBVARIABLEDICTIONARY)</td></tr><tr><td>102</td><td>End of persistent reactors group, always &quot;#&quot;</td></tr><tr><td>100</td><td>Subclass marker (DictionaryVariables)</td></tr><tr><td>280</td><td>Object schema number (currently set to 0)</td></tr><tr><td>1</td><td>Value of variable</td></tr></table>

DICTIONARYVAR objects are used by AutoCAD as a means to store named values in the database for setvar/getvar purposes without the need to add entries to the  $\mathrm{DXF}^{\mathrm{TM}}$  HEADER section. System variables that are stored as DICTIONARYVAR objects are the following: DEFAULTVIEWCATEGORY, DIMADEC, DIMASSOC, DIMDSEP, DRAWORDERCTL, FIELEVAL, HALOGAP, HIDETEXT, INDEXCTL, INDEXCTL, INTERSECTIONCOLOR, INTERSECTIONDISPLAY, MSOLESCALE, OBSCOLOR, OBSLTYPE, OLEFRAME, PROJECTNAME, SORTENTS, UPDATETHUMBMAIL, XCLIPFRAME, and XCLIPFRAME.

# DIMASSOC

The following group codes are used by DIMASSOC objects. In addition to the group codes described here, see Common Group Codes for Objects on page

160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">DIMASSOC group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (DIMASSOC)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Persistent reactors group; always “{ACAD_REACTORS}”</td></tr><tr><td>330</td><td>Soft-pointer ID</td></tr><tr><td>100</td><td>Subclass marker (AcDbDimAssoc)</td></tr><tr><td>330</td><td>ID of dimension object</td></tr><tr><td>90</td><td>Associativity flag
1 = First point reference
2 = Second point reference
4 = Third point reference
8 = Fourth point reference</td></tr><tr><td>70</td><td>Trans-space flag (true/false)</td></tr><tr><td>71</td><td>Rotated Dimension type (parallel, perpendicular)</td></tr><tr><td>1</td><td>Class name (AcDbOsnapPointRef)</td></tr><tr><td>72</td><td>Object Osnap type
0 = None
1 = Endpoint
2 = Midpoint
3 = Center
4 = Node
5 = Quadrant
6 = Intersection
7 = Insertion
8 = Perpendicular
9 = Tangent
10 = Nearest
11 = Apparent intersection</td></tr><tr><td></td><td>12 = Parallel</td></tr><tr><td></td><td>13 = Start point</td></tr><tr><td>331</td><td>ID of main object (geometry)</td></tr><tr><td>73</td><td>Subertype of main object (edge, face)</td></tr><tr><td>91</td><td>GsMarker of main object (index)</td></tr><tr><td>301</td><td>Handle (string) of Xref object</td></tr><tr><td>40</td><td>Geometry parameter for Near Osnap</td></tr><tr><td>10</td><td>Osnap point in WCS; X value</td></tr><tr><td>20</td><td>Osnap point in WCS; Y value</td></tr><tr><td>30</td><td>Osnap point in WCS; Z value</td></tr><tr><td>332</td><td>ID of intersection object (geometry)</td></tr><tr><td>74</td><td>Subertype of intersection object (edge/face)</td></tr><tr><td>92</td><td>GsMarker of intersection object (index)</td></tr><tr><td>302</td><td>Handle (string) of intersection Xref object</td></tr><tr><td>75</td><td>hasLastPointRef flag (true/false)</td></tr></table>

DIMASSOC objects implement associative dimensions by specifying an association between a dimension object and drawing geometry objects. An associative dimension is a dimension that will automatically update when the associated geometry is modified.

# FIELD

The following group codes are used by FIELD objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For

information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">FIELD group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (ACAD_FIELD)</td></tr><tr><td>1</td><td>Evaluator ID</td></tr><tr><td>2</td><td>Field code string</td></tr><tr><td>3</td><td>Overflow of field code string</td></tr><tr><td>90</td><td>Number of child fields</td></tr><tr><td>360</td><td>Child field ID (AcDbHardOwnershipId); repeats for number of children</td></tr><tr><td>97</td><td>Number of object IDs used in the field code</td></tr><tr><td>331</td><td>Object ID used in the field code (AcDbSoftPointerId); repeats for the number of object IDs used in the field code</td></tr><tr><td>93</td><td>Number of the data set in the field</td></tr><tr><td>6</td><td>Key string for the field data; a key-field pair is repeated for the number of data sets in the field</td></tr><tr><td>7</td><td>Key string for the evaluated cache; this key is hard-coded as ACFD_FIELD_VALUE</td></tr><tr><td>90</td><td>Data type of field value</td></tr><tr><td>91</td><td>Long value (if data type of field value is long)</td></tr><tr><td>140</td><td>Double value (if data type of field value is double)</td></tr><tr><td>330</td><td>ID value, AcDbSoftPointerId (if data type of field value is ID)</td></tr><tr><td>92</td><td>Binary data buffer size (if data type of field value is binary)</td></tr><tr><td>310</td><td>Binary data (if data type of field value is binary)</td></tr></table>

FIELD group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>301</td><td>Format string</td></tr><tr><td>9</td><td>Overflow of format string</td></tr><tr><td>98</td><td>Length of format string</td></tr></table>

# GEODATA

The following group codes are used by GEODATA objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

GEODATA group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>90</td><td>AcDbGeoData Object version</td></tr><tr><td></td><td>1 - 2009</td></tr><tr><td></td><td>2 - 2010</td></tr><tr><td>70</td><td>Type of design coordinates:</td></tr><tr><td></td><td>0 - Unknown</td></tr><tr><td></td><td>1 - Local grid</td></tr><tr><td></td><td>2 - Projected grid</td></tr><tr><td></td><td>3 - Geographic (latitude/longitude)</td></tr><tr><td>330</td><td>ObjectId of host block table record</td></tr><tr><td>10,20,30</td><td>Design point, reference point in WCS coordinates</td></tr><tr><td>11,21,31</td><td>Reference point in coordinate system coordinates, valid only when coordinate type is Local Grid.</td></tr><tr><td>12,22</td><td>North direction vector (2D)</td></tr><tr><td>40</td><td>Horizontal unit scale, factor which converts horizontal design coordinates to meters by multi- plication.</td></tr><tr><td>41</td><td>Vertical unit scale, factor which converts vertical design coordinates to meters by multiplication.</td></tr><tr><td colspan="2">GEODATA group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>91</td><td>Horizontal units per UnitsValue enumeration. Will be kUnitsUndefined if units specified by horizontal unit scale is not supported by AutoCAD enumeration.</td></tr><tr><td>92</td><td>Vertical units per UnitsValue enumeration. Will be kUnitsUndefined if units specified by horizontal unit scale is not supported by AutoCAD enumeration.</td></tr><tr><td>210,220,230</td><td>Up direction</td></tr><tr><td>95</td><td>Scale estimation method:
1 - None
2 - User specified scale factor
3 - Grid scale at reference point
4 - Prismoidal</td></tr><tr><td>294</td><td>Bool flag specifying whether to do sea level correction</td></tr><tr><td>141</td><td>User specified scale factor</td></tr><tr><td>142</td><td>Sea level elevation</td></tr><tr><td>143</td><td>Coordinate projection radius</td></tr><tr><td>301</td><td>Coordinate system definition string</td></tr><tr><td>302</td><td>GeoRSS tag</td></tr><tr><td>305</td><td>Observation from tag</td></tr><tr><td>306</td><td>Observation to tag</td></tr><tr><td>307</td><td>Observation coverage tag</td></tr><tr><td>93</td><td>Number of Geo-Mesh points</td></tr><tr><td>13,23</td><td>Coordinate of source mesh point (repeat)</td></tr><tr><td>14,24</td><td>Coordinate of destination mesh point (repeat)</td></tr><tr><td>96</td><td>Number of faces</td></tr><tr><td>97</td><td>Point index for face (repeat)</td></tr><tr><td>98</td><td>Point index for face (repeat)</td></tr><tr><td>99</td><td>Point index for face (repeat)</td></tr></table>

# GROUP

The following group codes are used by GROUP objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">GROUP group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (GROUP)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always “{ACAD_REACTORS” (persistent reactors group appears in all dictionaries except the main dictionary)</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary. For GROUP objects this is always the ACAD_GROUP
entry of the named object dictionary</td></tr><tr><td>102</td><td>End of persistent reactors group, always “}”</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner object</td></tr><tr><td>100</td><td>Subclass marker (AcDbGroup)</td></tr><tr><td>300</td><td>Group description</td></tr><tr><td>70</td><td>“Unnamed” flag: 1 = Unnamed; 0 = Named</td></tr><tr><td>71</td><td>Selectability flag: 1 = Selectable; 0 = Not selectable</td></tr><tr><td>340</td><td>Hard-pointer handle to entity in group (one entry per object)</td></tr></table>

# IDBUFFER

The following group codes are used by IDBUFFER objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">IDBUFFER group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbldBuffer)</td></tr><tr><td>330</td><td>Soft-pointer reference to entity (multiple entries may exist)</td></tr></table>

The IDBUFFER object is a utility object that is just a list of references to objects.

# IMAGEDEF

The following group codes are used by IMAGEDEF objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">IMAGEDEF group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (IMAGEDEF)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always “{ACAD_REACTORS}"</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to the ACAD_IMAGE_dict dictionary</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to IMAGEDEF_REACTOR object (multiple entries; one for each instance)</td></tr><tr><td>102</td><td>End of persistent reactors group, always “}”</td></tr><tr><td>100</td><td>Subclass marker (AcDbRasterImageDef)</td></tr><tr><td>90</td><td>Class version 0</td></tr><tr><td>1</td><td>File name of image</td></tr><tr><td>10</td><td>Image size in pixels
DXF: U value; APP: 2D point (U and V values)</td></tr><tr><td>20</td><td>DXF: V value of image size in pixels</td></tr><tr><td>11</td><td>Default size of one pixel in AutoCAD units
DXF: U value; APP: 2D point (U and V values)</td></tr><tr><td>12</td><td>DXF: V value of pixel size</td></tr><tr><td>280</td><td>Image-is-loaded flag. 0 = Unloaded; 1 = Loaded</td></tr><tr><td>281</td><td>Resolution units. 0 = No units; 2 = Centimeters; 5 = Inch</td></tr></table>

# IMAGEDEF_REACTOR

The following group codes are used by IMAGEDEF_REACTOR objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">IMAGEDEF_REACTOR group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (IMAGEDEF_REACTOR)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>100</td><td>Subclass marker (AcDbRasterImageDefReactor)</td></tr><tr><td>90</td><td>Class version 2</td></tr><tr><td>330</td><td>Object ID for associated image object</td></tr></table>

# LAYER_INDEX

The following group codes are used by LAYER_INDEX objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">LAYER_INDEX group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (LAYER_INDEX)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always &quot;#{ACAD_REACTORS}&quot;</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary</td></tr><tr><td>102</td><td>End of persistent reactors group, always &quot;#&quot;</td></tr><tr><td>100</td><td>Subclass marker (AcDbIndex)</td></tr><tr><td>40</td><td>Time stamp (Julian date)</td></tr><tr><td>100</td><td>Subclass marker (AcDbLayerIndex)</td></tr><tr><td>8</td><td>Layer name (multiple entries may exist)</td></tr><tr><td>360</td><td>Hard-owner reference to IDBUFFER (multiple entries may exist)</td></tr><tr><td>90</td><td>Number of entries in the IDBUFFER list (multiple entries may exist)</td></tr></table>

# LAYER_FILTER

The following group codes are used by LAYER_FILTER objects. In addition to the group codes described here, see Common Group Codes for Objects on

page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">LAYER_FILTER group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (LAYER_FILTER)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always &quot;#ACAD_REACTORS&quot;</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary</td></tr><tr><td>102</td><td>End of persistent reactors group, always &quot;#&quot;</td></tr><tr><td>100</td><td>Subclass marker (AcDbFilter)</td></tr><tr><td>100</td><td>Subclass marker (AcDbLayerFilter)</td></tr><tr><td>8</td><td>Layer name (multiple entries may exist)</td></tr></table>

# LAYOUT

The following group codes are used by LAYOUT objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

# LAYOUT group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (LAYOUT)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always "#ACAD_REACTORS"</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary</td></tr><tr><td>102</td><td>End of persistent reactors group, always "#"</td></tr><tr><td colspan="2">LAYOUT group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner object</td></tr><tr><td>100</td><td>Subclass marker (AcDbPlotSettings)</td></tr><tr><td>plotsettings object group codes</td><td>For group codes and descriptions following the AcDbPlotSettings marker, see PLOT SETTINGS on page 189</td></tr><tr><td>100</td><td>Subclass marker (AcDbLayout)</td></tr><tr><td>1</td><td>Layout name</td></tr><tr><td>70</td><td>Flag (bit-coded) to control the following:
1 = Indicates the PSLTSCALE value for this layout when this layout is current
2 = Indicates the LIMCHECK value for this layout when this layout is current</td></tr><tr><td>71</td><td>Tab order. This number is an ordinal indicating this layout's ordering in the tab control that is attached to the AutoCAD drawing frame window. Note that the “Model” tab always appears as the first tab regardless of its tab order</td></tr><tr><td>10</td><td>Minimum limits for this layout (defined by LIMMIN while this layout is current)
DXF: X value; APP: 2D point</td></tr><tr><td>20</td><td>DXF: Y value of minimum limits</td></tr><tr><td>11</td><td>Maximum limits for this layout (defined by LIMMAX while this layout is current):
DXF: X value; APP: 2D point</td></tr><tr><td>21</td><td>DXF: Y value of maximum limits</td></tr><tr><td>12</td><td>Insertion base point for this layout (defined by INSBASE while this layout is current):
DXF: X value; APP: 3D point</td></tr><tr><td>22, 32</td><td>DXF: Y and Z values of the insertion base point</td></tr><tr><td>14</td><td>Minimum extents for this layout (defined by EXTMIN while this layout is current):
DXF: X value; APP: 3D point</td></tr><tr><td>24, 34</td><td>DXF: Y and Z values of the minimum extents</td></tr><tr><td>15</td><td>Maximum extents for this layout (defined by EXTMAX while this layout is current):</td></tr><tr><td></td><td>DXF: X value; APP: 3D point</td></tr><tr><td>25, 35</td><td>DXF: Y and Z values of the maximum extents</td></tr><tr><td>146</td><td>Elevation</td></tr><tr><td>13</td><td>UCS origin
DXF: X value; APP: 3D point</td></tr><tr><td>23, 33</td><td>DXF: Y and Z values of UCS origin</td></tr><tr><td>16</td><td>UCS X-axis
DXF: X value; APP: 3D vector</td></tr><tr><td>26, 36</td><td>DXF: Y and Z values of UCS X-axis</td></tr><tr><td>17</td><td>UCS Y axis
DXF: X value; APP: 3D vector</td></tr><tr><td>27, 37</td><td>DXF: Y and Z values of UCS Y axis</td></tr><tr><td>76</td><td>Orthographic type of UCS
0 = UCS is not orthographic
1 = Top; 2 = Bottom
3 = Front; 4 = Back
5 = Left; 6 = Right</td></tr><tr><td>330</td><td>ID/handle to this layout's associated paper space block table record</td></tr><tr><td>331</td><td>ID/handle to the viewport that was last active in this layout when the layout was current</td></tr><tr><td>345</td><td>ID/handle of AcDbUCSTableRecord if UCS is a named UCS. If not present, then UCS is unnamed</td></tr><tr><td>346</td><td>ID/handle of AcDbUCSTableRecord of base UCS if UCS is orthographic (76 code is non-zero). If not present and 76 code is non-zero, then base UCS is taken to be WORLD</td></tr><tr><td>333</td><td>Shade plot ID</td></tr></table>

# LIGHTLIST

The following group codes are used by LIGHTLIST objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">LIGHTLIST group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (LIGHTLIST)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always &quot;#{ACAD_REACTORS}&quot;</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary. For LIGHTLIST objects, this is always the ACAD_LIGHT entry of the named object dictionary</td></tr><tr><td>102</td><td>End of persistent reactors group, always &quot;#&quot;</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner object</td></tr><tr><td>100</td><td>Subclass marker (AcDbLightList)</td></tr><tr><td>90</td><td>Version number</td></tr><tr><td>90</td><td>Number of lights</td></tr><tr><td>5</td><td>Light handle (one for each light)</td></tr><tr><td>1</td><td>Light name (one for each light)</td></tr></table>

# MATERIAL

The following group codes are used by MATERIAL objects. In addition to the group codes described here, see Common Group Codes for Objects on page

160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">MATERIAL group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (MATERIAL)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always “{ACAD_REACTORS” (The persistent reactors group appears in all dictionaries except the main dictionary.)</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary. For MATERIAL objects, this is always the ACAD MATERIAL entry of the named object dictionary.</td></tr><tr><td>102</td><td>End of persistent reactors group; always “}”</td></tr><tr><td>100</td><td>Subclass marker (AcDbMaterial)</td></tr><tr><td>1</td><td>Material name (string)</td></tr><tr><td>2</td><td>Description (string, default null string)</td></tr><tr><td>70</td><td>Ambient color method (default = 0):
0 = Use current color
1 = Override current color</td></tr><tr><td>40</td><td>Ambient color factor (real, default = 1.0; valid range is 0.0 to 1.0)</td></tr><tr><td>90</td><td>Ambient color value (unsigned 32-bit integer representing an AcCmEntityColor)</td></tr><tr><td>71</td><td>Diffuse color method (default = 0):
0 = Use current color
1 = Override current color</td></tr><tr><td>41</td><td>Diffuse color factor (real, default = 1.0; valid range is 0.0 to 1.0)</td></tr><tr><td>91</td><td>Diffuse color value (unsigned 32-bit integer representing an AcCmEntityColor)</td></tr><tr><td>42</td><td>Diffuse map blend factor (real, default = 1.0)</td></tr><tr><td>72</td><td>Diffuse map source (default = 1):</td></tr></table>

# MATERIAL group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td></td><td>0 = Use current scene</td></tr><tr><td></td><td>1 = Use image file (specified by file name; null file name specifies no map)</td></tr><tr><td>3</td><td>Diffuse map file name (string, default = null string)</td></tr><tr><td>73</td><td>Projection method of diffuse map mapper (default = 1):</td></tr><tr><td></td><td>1 = Planar</td></tr><tr><td></td><td>2 = Box</td></tr><tr><td></td><td>3 = Cylinder</td></tr><tr><td></td><td>4 = Sphere</td></tr><tr><td>74</td><td>Tiling method of diffuse map mapper (default = 1):</td></tr><tr><td></td><td>1 = Tile</td></tr><tr><td></td><td>2 = Crop</td></tr><tr><td></td><td>3 = Clamp</td></tr><tr><td>75</td><td>Auto transform method of diffuse map mapper (bitset, default = 1):</td></tr><tr><td></td><td>1 = No auto transform</td></tr><tr><td></td><td>2 = Scale mapper to current entity extents; translate mapper to entity origin</td></tr><tr><td></td><td>4 = Include current block transform in mapper transform</td></tr><tr><td>43</td><td>Transform matrix of diffuse map mapper (16 reals; row major format; default = identity matrix)</td></tr><tr><td>44</td><td>Specular gloss factor (real, default = 0.5)</td></tr><tr><td>76</td><td>Specular color method (default = 0):</td></tr><tr><td></td><td>0 = Use current color</td></tr><tr><td></td><td>1 = Override current color</td></tr><tr><td>45</td><td>Specular color factor (real, default = 1.0; valid range is 0.0 to 1.0)</td></tr><tr><td>92</td><td>Specular color value (unsigned 32-bit integer representing an AcCmEntityColor)</td></tr><tr><td>46</td><td>Specular map blend factor (real; default = 1.0)</td></tr><tr><td>77</td><td>Specular map source (default = 1):</td></tr><tr><td></td><td>0 = Use current scene</td></tr><tr><td></td><td>1 = Use image file (specified by file name; null file name specifies no map)</td></tr><tr><td>4</td><td>Specular map file name (string; default = null string)</td></tr><tr><td colspan="2">MATERIAL group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>78</td><td>Projection method of specular map mapper (default = 1):
1 = Planar
2 = Box
3 = Cylinder
4 = Sphere</td></tr><tr><td>79</td><td>Tiling method of specular map mapper (default = 1):
1 = Tile
2 = Crop
3 = Clamp</td></tr><tr><td>170</td><td>Auto transform method of specular map mapper (bitset; default = 1):
1 = No auto transform
2 = Scale mapper to current entity extents; translate mapper to entity origin
4 = Include current block transform in mapper transform</td></tr><tr><td>47</td><td>Transform matrix of specular map mapper (16 reals; row major format; default = identity matrix)</td></tr><tr><td>48</td><td>Blend factor of reflection map (real, default = 1.0)</td></tr><tr><td>171</td><td>Reflection map source (default = 1):
0 = Use current scene
1 = Use image file (specified by file name; null file name specifies no map)</td></tr><tr><td>6</td><td>Reflection map file name (string; default = null string)</td></tr><tr><td>172</td><td>Projection method of reflection map mapper (default = 1):
1 = Planar
2 = Box
3 = Cylinder
4 = Sphere</td></tr><tr><td>173</td><td>Tiling method of reflection map mapper (default = 1):
1 = Tile
2 = Crop
3 = Clamp</td></tr><tr><td>174</td><td>Auto transform method of reflection map mapper (bitset; default = 1):
1 = No auto transform
2 = Scale mapper to current entity extents; translate mapper to entity origin</td></tr><tr><td></td><td>4 = Include current block transform in mapper transform</td></tr><tr><td>49</td><td>Transform matrix of reflection map mapper (16 reals; row major format; default = identity matrix)</td></tr><tr><td>140</td><td>Opacity percent (real; default = 1.0)</td></tr><tr><td>141</td><td>Blend factor of opacity map (real; default = 1.0)</td></tr><tr><td>175</td><td>Opacity map source (default = 1):
0 = Use current scene
1 = Use image file (specified by file name; null file name specifies no map)</td></tr><tr><td>7</td><td>Opacity map file name (string; default = null string)</td></tr><tr><td>176</td><td>Projection method of opacity map mapper (default = 1):
1 = Planar
2 = Box
3 = Cylinder
4 = Sphere</td></tr><tr><td>177</td><td>Tiling method of opacity map mapper (default = 1):
1 = Tile
2 = Crop
3 = Clamp</td></tr><tr><td>178</td><td>Auto transform method of opacity map mapper (bitset; default = 1):
1 = No auto transform
2 = Scale mapper to current entity extents; translate mapper to entity origin
4 = Include current block transform in mapper transform</td></tr><tr><td>142</td><td>Transform matrix of opacity map mapper (16 reals; row major format; default = identity matrix)</td></tr><tr><td>143</td><td>Blend factor of bump map (real; default = 1.0)</td></tr><tr><td>179</td><td>Bump map source (default = 1):
0 = Use current scene
1 = Use image file (specified by file name; null file name specifies no map)</td></tr><tr><td>8</td><td>Bump map file name (string; default = null string)</td></tr><tr><td>270</td><td>Projection method of bump map mapper (default = 1):
1 = Planar
2 = Box
3 = Cylinder
4 = Sphere</td></tr><tr><td>271</td><td>Tiling method of bump map mapper (default = 1):
1 = Tile
2 = Crop
3 = Clamp</td></tr><tr><td>272</td><td>Auto transform method of bump map mapper (bitset; default = 1):
1 = No auto transform
2 = Scale mapper to current entity extents; translate mapper to entity origin
4 = Include current block transform in mapper transform</td></tr><tr><td>144</td><td>Transform matrix of bump map mapper (16 reals; row major format; default = identity matrix)</td></tr><tr><td>145</td><td>Refraction index (real; default = 1.0)</td></tr><tr><td>146</td><td>Blend factor of refraction map (real; default = 1.0)</td></tr><tr><td>273</td><td>Refraction map source (default = 1):
0 = Use current scene
1 = Use image file (specified by file name; null file name specifies no map)</td></tr><tr><td>9</td><td>Refraction map file name (string; default = null string)</td></tr><tr><td>274</td><td>Projection method of refraction map mapper (default = 1):
1 = Planar
2 = Box
3 = Cylinder
4 = Sphere</td></tr><tr><td>275</td><td>Tiling method of refraction map mapper (default = 1):
1 = Tile
2 = Crop
3 = Clamp</td></tr><tr><td>276</td><td>Auto transform method of refraction map mapper (bitset; default = 1):</td></tr><tr><td></td><td>1 = No auto transform</td></tr><tr><td></td><td>2 = Scale mapper to current entity extents; translate mapper to entity origin</td></tr><tr><td></td><td>4 = Include current block transform in mapper transform</td></tr><tr><td>147</td><td>Transform matrix of refraction map mapper (16 reals; row major format; default = identity matrix)</td></tr><tr><td>460</td><td>Color Bleed Scale</td></tr><tr><td>461</td><td>Indirect Dump Scale</td></tr><tr><td>462</td><td>Reflectance Scale</td></tr><tr><td>463</td><td>Transmittance Scale</td></tr><tr><td>290</td><td>Two-sided Material</td></tr><tr><td>464</td><td>Luminance</td></tr><tr><td>270</td><td>Luminance Mode</td></tr><tr><td>271</td><td>Normal Map Method</td></tr><tr><td>465</td><td>Normal Map Strength</td></tr><tr><td>42</td><td>Normal Map Blend Factor</td></tr><tr><td>72</td><td>Normal Map Source</td></tr><tr><td>3</td><td>Normal Map Source File Name</td></tr><tr><td>73</td><td>Normal Mapper Projection</td></tr><tr><td>74</td><td>Normal Mapper Tiling</td></tr><tr><td>75</td><td>Normal Mapper Auto Transform</td></tr><tr><td>43</td><td>Normal Mapper Transform</td></tr><tr><td>293</td><td>Materials Anonymous</td></tr><tr><td>272</td><td>Global Illumination Mode</td></tr><tr><td>273</td><td>Final Gather Mode</td></tr><tr><td>300</td><td>GenProcName</td></tr><tr><td>291</td><td>GenProcValBool</td></tr><tr><td>271</td><td>GenProcVallnt</td></tr><tr><td>469</td><td>GenProcValReal</td></tr><tr><td>301</td><td>GenProcValText</td></tr><tr><td>292</td><td>GenProcTableEnd</td></tr><tr><td>62</td><td>GenProcValColorIndex</td></tr><tr><td>420</td><td>GenProcValColorRGB</td></tr><tr><td>430</td><td>GenProcValColorName</td></tr><tr><td>270</td><td>Map UTile</td></tr><tr><td>148</td><td>Translucence</td></tr><tr><td>90</td><td>Self-Illuminaton</td></tr><tr><td>468</td><td>Reflectivity</td></tr><tr><td>93</td><td>Illumination Model</td></tr><tr><td>94</td><td>Channel Flags</td></tr></table>

# MLINESTYLE

The following group codes are used by MLINESTYLE objects. In addition to the group codes described here, see Common Group Codes for Objects on

page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">MLINESTYLE group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (MLINESTYLE)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always “{ACAD_REACTORS” (persistent reactors group appears in all dictionaries except the main dictionary)</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary. For MLINESTYLE objects this is always the ACAD_MLINESTYLE entry of the named object dictionary</td></tr><tr><td>102</td><td>End of persistent reactors group; always “}”</td></tr><tr><td>100</td><td>Subclass marker (AcDbMlineStyle)</td></tr><tr><td>2</td><td>Mline style name</td></tr><tr><td>70</td><td>Flags (bit-coded):1 =Fill on2 = Display miters16 = Start square end (line) cap32 = Start inner arcs cap64 = Start round (outer arcs) cap256 = End square (line) cap512 = End inner arcs cap1024 = End round (outer arcs) cap</td></tr><tr><td>3</td><td>Style description (string, 255 characters maximum)</td></tr><tr><td>62</td><td>Fill color (integer, default = 256)</td></tr><tr><td>51</td><td>Start angle (real, default is 90 degrees)</td></tr><tr><td>52</td><td>End angle (real, default is 90 degrees)</td></tr><tr><td>71</td><td>Number of elements</td></tr><tr><td>49</td><td>Element offset (real, no default). Multiple entries can exist; one entry for each element</td></tr></table>

MLINESTYLE group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>62</td><td>Element color (integer, default = 0). Multiple entries can exist; one entry for each element</td></tr><tr><td>6</td><td>Element linetype (string, default = BYLAYER). Multiple entries can exist; one entry for each element</td></tr></table>

The 2 group codes in mline entities and MLINSTYLE objects are redundant fields. These groups should not be modified under any circumstances, although it is safe to read them and use their values. The correct fields to modify are

Mline The 340 group in the same object, which indicates the proper MLINESTYLE object.

Mlinestyle The 3 group value in the MLINESTYLE dictionary, which precedes the 350 group that has the handle or entity name of the current mlinestyle.

# OBJECT_PTR

The following group codes are used by OBJECT_PTR objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

OBJECT_PTR group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (OBJECT_PTR)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always &quot;#ACAD_REACTORS&quot;</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary</td></tr><tr><td>102</td><td>End of persistent reactors group, always &quot;#)&quot;</td></tr><tr><td>1001</td><td>Begin ASE xdata (DC015)</td></tr></table>

# PLOT SETTINGS

The following group codes are used by PLOT SETTINGS objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">PLOT SETTINGS group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (PLOT SETTINGS)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always “{ACAD_REACTORS}&quot;</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary</td></tr><tr><td>102</td><td>End of persistent reactors group, always “}”</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner object</td></tr><tr><td>100</td><td>Subclass marker (AcDbPlotSettings)</td></tr><tr><td>1</td><td>Page Setup name</td></tr><tr><td>2</td><td>Name of system printer or plot configuration file</td></tr><tr><td>4</td><td>Paper size</td></tr><tr><td>6</td><td>Plot view name</td></tr><tr><td>40</td><td>Size, in millimeters, of unprintable margin on left side of paper</td></tr><tr><td>41</td><td>Size, in millimeters, of unprintable margin on bottom of paper</td></tr><tr><td>42</td><td>Size, in millimeters, of unprintable margin on right side of paper</td></tr><tr><td>43</td><td>Size, in millimeters, of unprintable margin on top of paper</td></tr><tr><td>44</td><td>Plot paper size: physical paper width in millimeters</td></tr><tr><td>45</td><td>Plot paper size: physical paper height in millimeters</td></tr></table>

PLOTSETTINGSGroup codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>46</td><td>Plot origin: X value of origin offset in millimeters</td></tr><tr><td>47</td><td>Plot origin: Y value of origin offset in millimeters</td></tr><tr><td>48</td><td>Plot window area: X value of lower-left window corner</td></tr><tr><td>49</td><td>Plot window area: Y value of upper-right window corner</td></tr><tr><td>140</td><td>Plot window area: X value of lower-left window corner</td></tr><tr><td>141</td><td>Plot window area: Y value of upper-right window corner</td></tr><tr><td>142</td><td>Numerator of custom print scale: real world (paper) units</td></tr><tr><td>143</td><td>Denominator of custom print scale: drawing units</td></tr><tr><td>70</td><td>Plot layout flag:
1 = PlotViewportBorders
2 = ShowPlotStyles
4 = PlotCentered
8 = PlotHidden
16 = UseStandardScale
32 = PlotPlotStyles
64 = ScaleLineweights
128 = PrintLineweights
512 = DrawViewportsFirst
1024 = ModelType
2048 = UpdatePaper
4096 = ZoomToPaperOnUpdate
8192 = Initializing
16384 = PrevPlotInit</td></tr><tr><td>72</td><td>Plot paper units:
0 = Plot in inches
1 = Plot in millimeters
2 = Plot in pixels</td></tr><tr><td>73</td><td>Plot rotation:
0 = No rotation
1 = 90 degrees counterclockwise</td></tr></table>

# PLOT SETTINGS group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td></td><td>2 = Upside-down</td></tr><tr><td></td><td>3 = 90 degrees clockwise</td></tr><tr><td>74</td><td>Plot type (portion of paper space to output to the media):</td></tr><tr><td></td><td>0 = Last screen display</td></tr><tr><td></td><td>1 = Drawing extents</td></tr><tr><td></td><td>2 = Drawing limits</td></tr><tr><td></td><td>3 = View specified by code 6</td></tr><tr><td></td><td>4 = Window specified by codes 48, 49, 140, and 141</td></tr><tr><td></td><td>5 = Layout information</td></tr><tr><td>7</td><td>Current style sheet</td></tr><tr><td>75</td><td>Standard scale type:</td></tr><tr><td></td><td>0 = Scaled to Fit</td></tr><tr><td></td><td>1 = 1/128&quot;=1&#x27;; 2 = 1/64&quot;=1&#x27;; 3 = 1/32&quot;=1&#x27;</td></tr><tr><td></td><td>4 = 1/16&quot;=1&#x27;; 5 = 3/32&quot;=1&#x27;; 6 = 1/8&quot;=1&#x27;</td></tr><tr><td></td><td>7 = 3/16&quot;=1&#x27;; 8 = 1/4&quot;=1&#x27;; 9 = 3/8&quot;=1&#x27;</td></tr><tr><td></td><td>10 = 1/2&quot;=1&#x27;; 11 = 3/4&quot;=1&#x27;; 12 = 1&quot;=1&#x27;</td></tr><tr><td></td><td>13 = 3&quot;=1&#x27;; 14 = 6&quot;=1&#x27;; 15 = 1&#x27;=1&#x27;</td></tr><tr><td></td><td>16 = 1:1; 17 = 1:2; 18 = 1:4; 19 = 1:8; 20 = 1:10; 21 = 1:16</td></tr><tr><td></td><td>22 = 1:20; 23 = 1:30; 24 = 1:40; 25 = 1:50; 26 = 1:100</td></tr><tr><td></td><td>27 = 2:1; 28 = 4:1; 29 = 8:1; 30 = 10:1; 31 = 100:1; 32 = 1000:1</td></tr><tr><td>76</td><td>ShadePlot mode:</td></tr><tr><td></td><td>0 = As Displayed</td></tr><tr><td></td><td>1 = Wireframe</td></tr><tr><td></td><td>2 = Hidden</td></tr><tr><td></td><td>3 = Rendered</td></tr><tr><td>77</td><td>ShadePlot resolution level:</td></tr><tr><td></td><td>0 = Draft</td></tr><tr><td></td><td>1 = Preview</td></tr><tr><td></td><td>2 = Normal</td></tr><tr><td></td><td>3 = Presentation</td></tr><tr><td></td><td>4 = Maximum</td></tr><tr><td></td><td>5 = Custom</td></tr><tr><td>78</td><td>ShadePlot custom DPI:</td></tr><tr><td></td><td>Valid range: 100 to 32767</td></tr></table>

PLOT SETTINGS group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td></td><td>Only applied when the ShadePlot resolution level is set to 5 (Custom)</td></tr><tr><td>147</td><td>A floating point scale factor that represents the standard scale value specified in code 75</td></tr><tr><td>148</td><td>Paper image origin: X value</td></tr><tr><td>149</td><td>Paper image origin: Y value</td></tr><tr><td>333</td><td>ShadePlot ID/Handle (optional)</td></tr></table>

# RASTERVARIABLES

The following group codes are used by RASTERVARIABLES objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

RASTERVARIABLES group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (RASTERVARIABLES)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always &quot;#{ACAD_REACTORS}&quot;</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary. For a RASTERVARIABLES object, this is always the ACAD_IMAGEVars entry of the named object dictionary</td></tr><tr><td>102</td><td>End of persistent reactors group; always &quot;)&quot;</td></tr><tr><td>100</td><td>Subclass marker (AcDbRasterVariables)</td></tr><tr><td>90</td><td>Class version 0</td></tr><tr><td>70</td><td>Display-image-frame flag: 0 = No frame; 1 = Display frame</td></tr><tr><td>71</td><td>Image display quality (screen only): 0 = Draft; 1 = High</td></tr></table>

# RASTERVARIABLES group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>72</td><td>AutoCAD units for inserting images. This is what one AutoCAD unit is equal to for the purpose of inserting and scaling images with an associated resolution:
0 = None; 1 = Millimeter; 2 = Centimeter
3 = Meter; 4 = Kilometer; 5 = Inch
6 = Foot; 7 = Yard; 8 = Mile</td></tr></table>

# RENDER

Render related group codes.

# RENDERENVIRONMENT

The following group codes are used by RENDERENVIRONMENT objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">RENDERENVIRONMENT group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (RENDERENVIRONMENT)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always &quot;#{ACAD_REACTORS}&quot;</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary. For a RENDERENVIRONMENT object, this is always the ACAD_RENDEREnvIRONMENT entry of the named object dictionary</td></tr><tr><td>102</td><td>End of persistent reactors group; always &#x27;}&#x27;&#x27;</td></tr><tr><td>100</td><td>Subclass marker (AcDbRenderEnvironment)</td></tr><tr><td>90</td><td>Class version 1</td></tr><tr><td>290</td><td>Fog enabled flag; 1 if enabled</td></tr><tr><td>290</td><td>Fog in background flag; 1 if enabled</td></tr></table>

RENDERENVIRONMENT group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>280, 280, 280</td><td>Fog color; Red, green, and blue channel values</td></tr><tr><td>40, 40</td><td>Fog density; Near and Far density as a percentage</td></tr><tr><td>40, 40</td><td>Near and Far distance as a percentage of the distance between the camera and the far clipping plane</td></tr><tr><td>290</td><td>Environment image flag</td></tr><tr><td>1</td><td>Environment image file name (can be blank if the previous flag is 0)</td></tr></table>

# MENTALRAYRENDERSETTINGS

The following group codes are used by MENTALRAYRENDERSETTINGS objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

MENTALRAYRENDERSETTINGS group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (MENTALRAYRENDERSETTINGS)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always &quot;#{ACAD_REACTORS}&quot;</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary</td></tr><tr><td>102</td><td>End of persistent reactors group; always &quot;)&quot;</td></tr><tr><td>100</td><td>Subclass marker (AcDbRenderSettings)</td></tr><tr><td>90</td><td>Class version 1</td></tr><tr><td>1</td><td>Render preset name</td></tr><tr><td>290</td><td>Render materials flag</td></tr></table>

MENTALRAYRENDERSETTINGS group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>90</td><td>Texture sampling quality</td></tr><tr><td>290</td><td>Render back-faces flag</td></tr><tr><td>290</td><td>Render shadows flag</td></tr><tr><td>1</td><td>Preview image file name (can be blank)</td></tr><tr><td>100</td><td>Subclass marker (AcDbMentalRayRenderSettings)</td></tr><tr><td>90</td><td>Class version 1</td></tr><tr><td>90</td><td>Sampling rate (minimum)</td></tr><tr><td>90</td><td>Sampling rate (maximum)</td></tr><tr><td>70</td><td>Sampling filter type
0 = Box
1 = Triangle
2 = Gauss
3 = Mitchell
4 = Lanczos</td></tr><tr><td>40, 40</td><td>Filter width, height</td></tr><tr><td>40, 40, 40, 40</td><td>Sampling contrast color; Red, green, blue, and alpha channel values</td></tr><tr><td>70</td><td>Shadow mode
0 = Simple
1 = Sort
2 = Segment</td></tr><tr><td>290</td><td>Shadow map flag; applies only to lights using mapped shadows</td></tr><tr><td>290</td><td>Ray tracing flag</td></tr><tr><td>90, 90, 90</td><td>Ray tracing depth for reflections, refractions, and maximum depth</td></tr><tr><td>290</td><td>Global illumination flag</td></tr><tr><td colspan="2">MENTALRAYRENDERSETTINGS group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>90</td><td>Photons/sample count</td></tr><tr><td>290</td><td>Global illumination radius flag</td></tr><tr><td>40</td><td>Global illumination sample radius</td></tr><tr><td>90</td><td>Photons per light</td></tr><tr><td>90, 90, 90</td><td>Global illumination photo trace depth for reflections, refractions, and maximum depth</td></tr><tr><td>290</td><td>Final gather flag</td></tr><tr><td>90</td><td>Final gather ray count</td></tr><tr><td>290, 290</td><td>Final gather minimum and maximum radius flags</td></tr><tr><td>290</td><td>Final gather pixels flag</td></tr><tr><td>40, 40</td><td>Final gather minimum and maximum sample radius</td></tr><tr><td>40</td><td>Luminance scale (energy multiplier)</td></tr><tr><td>70</td><td>Diagnostic mode
0 = Off
1 = Grid
2 = Photon
4 = BSP</td></tr><tr><td>70</td><td>Diagnostic Grid mode
0 = Object
1 = World
2 = Camera</td></tr><tr><td>40</td><td>Grid size</td></tr><tr><td>70</td><td>Diagnostic Photon mode
0 = Density
1 = Irradiance</td></tr><tr><td>70</td><td>Diagnostic BSP mode</td></tr></table>

MENTALRAYRENDERSETTINGS group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td></td><td>0 = Depth</td></tr><tr><td></td><td>1 = Size</td></tr><tr><td>290</td><td>Export MI statistics flag</td></tr><tr><td>1</td><td>MI statistics file name (can be blank)</td></tr><tr><td>90</td><td>Tile size</td></tr><tr><td>70</td><td>Tile order</td></tr><tr><td></td><td>0 = Hilbert</td></tr><tr><td></td><td>1 = Spiral</td></tr><tr><td></td><td>2 = Left to right</td></tr><tr><td></td><td>3 = Right to left</td></tr><tr><td></td><td>4 = Top to bottom</td></tr><tr><td></td><td>5 = Bottom to top</td></tr><tr><td>90</td><td>Memory limit</td></tr></table>

# RENDERGLOBAL

The following group codes are used by RENDERGLOBAL objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

RENDERGLOBAL group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (RENDERGLOBAL)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always "#{ACAD_REACTORS}"</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary. For a RENDERGLOBAL object, this is always the ACAD_RENDER.Global entry of the named object dictionary</td></tr><tr><td>102</td><td>End of persistent reactors group; always ")"</td></tr><tr><td colspan="2">RENDERGLOBAL group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbRenderGlobal)</td></tr><tr><td>90</td><td>Class version 2</td></tr><tr><td>90</td><td>Render procedure:
0 = View
1 = Crop
2 = Selection</td></tr><tr><td>90</td><td>Render destination
0 = Render Window
1 = Viewport</td></tr><tr><td>290</td><td>Save to file flag</td></tr><tr><td>1</td><td>Rendered image save file name</td></tr><tr><td>90</td><td>Image width</td></tr><tr><td>90</td><td>Image height</td></tr><tr><td>290</td><td>Predefined presets first flag</td></tr><tr><td>290</td><td>High info level flag</td></tr></table>

# SECTION

Section manager and section settings group codes.

# Section Manager

The following group codes apply to SECTIONMANAGER objects. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">SECTIONMANAGER group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (SECTIONMANAGER)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always “{ACAD_REACTORS}&quot;</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary</td></tr><tr><td>102</td><td>End of persistent reactors group, always “}”</td></tr><tr><td>330</td><td>Soft-owner ID/handle to owner object</td></tr><tr><td>100</td><td>Subclass marker (AcDbSectionManager)</td></tr><tr><td>70</td><td>Requires full update flag</td></tr><tr><td>90</td><td>Number of sections</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to section entities (repeats for number of sections)</td></tr></table>

# Section Settings

The following group codes apply to SECTION SETTINGS objects. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">SECTIONSETTINGS group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (SECTIONSETTINGS)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always “{ACAD_REACTORS”</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary</td></tr><tr><td>102</td><td>End of persistent reactors group, always “}”</td></tr><tr><td>330</td><td>Soft-owner ID/handle to owner object</td></tr><tr><td>100</td><td>Subclass marker (AcDbSectionSettings)</td></tr><tr><td>90</td><td>Section type</td></tr><tr><td>91</td><td>Number of generation settings</td></tr><tr><td></td><td>Section Type Settings data follows</td></tr></table>

# Section Type Settings

The following group codes apply to Section Type settings. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">Section Type Settings group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>1</td><td>“SectionTypeSettings” marker</td></tr><tr><td>90</td><td>Section type</td></tr><tr><td>91</td><td>Generation option flag</td></tr><tr><td>92</td><td>Number of source objects</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to source objects (repeats for number of source objects)</td></tr><tr><td>331</td><td>Soft-pointer ID/handle to destination block object</td></tr><tr><td>1</td><td>Destination file name</td></tr><tr><td>93</td><td>Number of generation settings</td></tr><tr><td>2</td><td>“SectionGeometrySettings” data marker</td></tr><tr><td></td><td>Section geometry settings data</td></tr><tr><td>3</td><td>“SectionTypeSettingsEnd” marker</td></tr></table>

# Section Geometry Settings

The following group codes apply to Section geometry settings. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">Section geometry settings group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>90</td><td>Section type</td></tr><tr><td>91</td><td>Geometry count</td></tr><tr><td>92</td><td>Bitflags</td></tr><tr><td>63</td><td>Color data</td></tr><tr><td>8</td><td>Layer name</td></tr><tr><td>6</td><td>Linetype name</td></tr><tr><td>40</td><td>Linetype scale</td></tr><tr><td>1</td><td>Plotstyle name</td></tr><tr><td>370</td><td>Line weight</td></tr><tr><td>70</td><td>Face transparency</td></tr><tr><td>71</td><td>Edge transparency</td></tr><tr><td>72</td><td>Hatch pattern type</td></tr><tr><td>2</td><td>Hatch pattern name</td></tr><tr><td>41</td><td>Hatch angle</td></tr><tr><td>42</td><td>Hatch scale</td></tr><tr><td>43</td><td>Hatch spacing</td></tr><tr><td>3</td><td>“SectionGeometrySettingsEnd” data marker</td></tr></table>

# SPATIAL_INDEX

The following group codes are used by SPATIAL_INDEX objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">SPATIAL_INDEX group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (SPATIAL_INDEX)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always “{ACAD_REACTORS}&quot;</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary</td></tr><tr><td>102</td><td>End of persistent reactors group, always “}”</td></tr><tr><td>100</td><td>Subclass marker (AcDbIndex)</td></tr><tr><td>40</td><td>Timestamp (Julian date)</td></tr><tr><td>100</td><td>Subclass marker (AcDbSpatialIndex)</td></tr></table>

The SPATIAL_INDEX is always written out empty to a DXF file. This object can be ignored.

# SPATIAL_FILTER

The following group codes are used by SPATIAL_FILTER objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">SPATIAL_FILTER group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (SPATIAL_FILTER)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always “{ACAD_REACTORS}"</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary (SPATIAL)</td></tr><tr><td>102</td><td>End of persistent reactors group, always “}”</td></tr><tr><td>100</td><td>Subclass marker (AcDbFilter)</td></tr><tr><td>100</td><td>Subclass marker (AcDbSpatialFilter)</td></tr><tr><td>70</td><td>Number of points on the clip boundary
2 = Rectangular clip boundary (lower-left and upper-right)
greater than 2 = Polyline clip boundary</td></tr><tr><td>10</td><td>Clip boundary definition point (in OCS) (always 2 or more) based on an xref scale of 1
DXF: X value; APP: 2D point</td></tr><tr><td>20</td><td>DXF: Y value of boundary definition point (always 2 or more)</td></tr><tr><td>210</td><td>Normal to the plane containing the clip boundary
DXF: X value; APP: 3D vector</td></tr><tr><td>220, 230</td><td>DXF: Y and Z values of extrusion direction</td></tr><tr><td>11</td><td>Origin used to define the local coordinate system of the clip boundary
DXF: X value; APP: 3D point</td></tr><tr><td>21, 31</td><td>Origin used to define the local coordinate system of the clip boundary DXF: Y and Z values</td></tr><tr><td>71</td><td>Clip boundary display enabled flag 0 = Disabled; 1 = Enabled</td></tr><tr><td>72</td><td>Front clipping plane flag; 0 = No; 1 = Yes</td></tr><tr><td>40</td><td>Front clipping plane distance (if code 72 = 1)</td></tr><tr><td>73</td><td>Back clipping plane flag; 0 = No; 1 = Yes</td></tr><tr><td>41</td><td>Back clipping plane distance (if code 73 = 1)</td></tr><tr><td>40</td><td>4x3 transformation matrix written out in column major order. This matrix is the inverse of the original block reference (insert entity) transformation. The original block reference transformation is the one that is applied to all entities in the block when the block reference is regenerated (always 12 entries)</td></tr><tr><td>40</td><td>4x3 transformation matrix written out in column major order. This matrix transforms points into the coordinate system of the clip boundary (12 entries)</td></tr></table>

# SORTENTSTABLE

The following group codes are used by SORTENTSTABLE objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">SORTENTSTABLE group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (SORTENTSTABLE)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always “{ACAD_REACTORS}&quot;</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary (ACAD_SORTENTS)</td></tr></table>

# SORTENTSTABLE group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>102</td><td>End of persistent reactors group; always “}”</td></tr><tr><td>100</td><td>Subclass marker (AcDbSortentsTable)</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner (currently only the *MODEL_SPACE or *PAPER_SPACE blocks)</td></tr><tr><td>331</td><td>Soft-pointer ID/handle to an entity (zero or more entries may exist)</td></tr><tr><td>5</td><td>Sort handle (zero or more entries may exist)</td></tr></table>

If the SORTENTS Regen flag (bit-code value 16) is set, AutoCAD regenerates entities in ascending handle order. When the DRAWORDER command is used, a SORTENTSTABLE object is attached to the *Model_Space or*Paper_Space block's extension dictionary under the name ACAD_SORTENTS. The SORTENTSTABLE object related to this dictionary associates a different handle with each entity, which redefines the order in which the entities are regenerated.

# TABLESTYLE

The following group codes are used by TABLESTYLE objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

TABLESTYLE group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (TABLESTYLE)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always "#ACAD_REACTORS" (The persistent reactors group appears in all dictionaries except the main dictionary.)</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary. For TABLESTYLE objects, this code is always the ACAD_TABLESTYLE entry of the named object dictionary</td></tr><tr><td colspan="2">TABLESTYLE group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>102</td><td>End of persistent reactors group, always “)”</td></tr><tr><td>100</td><td>Subclass marker (AcDbTableStyle)</td></tr><tr><td>280</td><td>Version number:
0 = 2010</td></tr><tr><td>3</td><td>Table style description (string; 255 characters maximum)</td></tr><tr><td>70</td><td>FlowDirection (integer):
0 = Down
1 = Up</td></tr><tr><td>71</td><td>Flags (bit-coded)</td></tr><tr><td>40</td><td>Horizontal cell margin (real; default = 0.06)</td></tr><tr><td>41</td><td>Vertical cell margin (real; default = 0.06)</td></tr><tr><td>280</td><td>Flag for whether the title is suppressed:
0 = Not suppressed
1 = Suppressed</td></tr><tr><td>281</td><td>Flag for whether the column heading is suppressed:
0 = Not suppressed
1 = Suppressed</td></tr><tr><td></td><td>The following group codes are repeated for every cell in the table</td></tr><tr><td>7</td><td>Text style name (string; default = STANDARD)</td></tr><tr><td>140</td><td>Text height (real)</td></tr><tr><td>170</td><td>Cell alignment (integer)</td></tr><tr><td>62</td><td>Text color (integer; default = BYBLOCK)</td></tr><tr><td>63</td><td>Cell fill color (integer; default = 7)</td></tr><tr><td>283</td><td>Flag for whether background color is enabled (default = 0):</td></tr><tr><td></td><td>0 = Disabled</td></tr><tr><td></td><td>1 = Enabled</td></tr><tr><td>90</td><td>Cell data type</td></tr><tr><td>91</td><td>Cell unit type</td></tr><tr><td>274-279</td><td>Lineweight associated with each border type of the cell (default = kLnWtByBlock)</td></tr><tr><td>284-289</td><td>Flag for visibility associated with each border type of the cell (default = 1):0 = Invisible1 = Visible</td></tr><tr><td>64-69</td><td>Color value associated with each border type of the cell (default = BYBLOCK)</td></tr></table>

# UNDERLAYDEFINITION

The following group codes apply to UNDERLAYDEFINITION symbol table entries. In addition to the group codes described here, see Common Group Codes for Symbol Table Entries on page 37. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">UNDERLAYDEFINITION group codes</td></tr><tr><td>Group Code</td><td>Description</td></tr><tr><td>0</td><td>Object name (UNDERLAYDEFINITION)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always &quot;#{ACAD_REACTORS}&quot;</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary</td></tr><tr><td>102</td><td>End of persistent reactors group, always &quot;#&quot;</td></tr><tr><td>100</td><td>Subclass marker (AcDbUnderlayDefinition)</td></tr></table>

# UNDERLAYDEFINITION group codes

# Group Description Code

1 Underlay path and file name
2 Underlay Name

# VISUALSTYLE

The following group codes apply to VISUALSTYLE objects. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

# VISUALSTYLE group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (VISUALSTYLE)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always &quot;#ACAD_REACTORS&quot;</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary</td></tr><tr><td>102</td><td>End of persistent reactors group, always &quot;#)&quot;</td></tr><tr><td>330</td><td>Soft-owner ID/handle to owner object</td></tr><tr><td>100</td><td>Subclass marker (AcDbVisualStyle)</td></tr><tr><td>2</td><td>Description</td></tr><tr><td>70</td><td>Type</td></tr><tr><td>71</td><td>Face lighting model
0 = Invisible
1 = Visible
2 = Phong
3 = Gooch</td></tr><tr><td>72</td><td>Face lighting quality</td></tr></table>

VISUALSTYLE group codes

<table><tr><td>Group code</td><td>Description</td></tr><tr><td></td><td>0 = No lighting</td></tr><tr><td></td><td>1 = Per face lighting</td></tr><tr><td></td><td>2 = Per vertex lighting</td></tr><tr><td>73</td><td>Face color mode</td></tr><tr><td></td><td>0 = No color</td></tr><tr><td></td><td>1 = Object color</td></tr><tr><td></td><td>2 = Background color</td></tr><tr><td></td><td>3 = Custom color</td></tr><tr><td></td><td>4 = Mono color</td></tr><tr><td></td><td>5 = Tinted</td></tr><tr><td></td><td>6 = Desaturated</td></tr><tr><td>90</td><td>Face modifiers</td></tr><tr><td></td><td>0 = No modifiers</td></tr><tr><td></td><td>1 = Opacity</td></tr><tr><td></td><td>2 = Specular</td></tr><tr><td>40</td><td>Face opacity level</td></tr><tr><td>41</td><td>Face specular level</td></tr><tr><td>62, 63</td><td>Color</td></tr><tr><td>421</td><td>Face style mono color</td></tr><tr><td>74</td><td>Edge style model</td></tr><tr><td></td><td>0 = No edges</td></tr><tr><td></td><td>1 = Isolines</td></tr><tr><td></td><td>2 = Facet edges</td></tr><tr><td>91</td><td>Edge style</td></tr><tr><td>64</td><td>Edge intersection color</td></tr><tr><td>65</td><td>Edge obscured color</td></tr><tr><td>75</td><td>Edge obscured linetype</td></tr><tr><td>175</td><td>Edge intersection linetype</td></tr><tr><td colspan="2">VISUALSTYLE group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>42</td><td>Edge crease angle</td></tr><tr><td>92</td><td>Edge modifiers</td></tr><tr><td>66</td><td>Edge color</td></tr><tr><td>43</td><td>Edge opacity level</td></tr><tr><td>76</td><td>Edge width</td></tr><tr><td>77</td><td>Edge overhang</td></tr><tr><td>78</td><td>Edge jitter</td></tr><tr><td>67</td><td>Edge silhouette color</td></tr><tr><td>79</td><td>Edge silhouette width</td></tr><tr><td>170</td><td>Edge halo gap</td></tr><tr><td>171</td><td>Number of edge isolines</td></tr><tr><td>290</td><td>Edge hide precision flag</td></tr><tr><td>174</td><td>Edge style apply flag</td></tr><tr><td>93</td><td>Display style display settings</td></tr><tr><td>44</td><td>Brightness</td></tr><tr><td>173</td><td>Shadow type</td></tr><tr><td>291</td><td>Internal use only flag</td></tr></table>

# VBA PROJECT

The following group codes are used by VBAPROJECT objects. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">VBA PROJECT group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (VBA PROJECT)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always “{ACAD_REACTORS}&quot;</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary</td></tr><tr><td>102</td><td>End of persistent reactors group, always “}”</td></tr><tr><td>330</td><td>Soft-owner ID/handle to owner object</td></tr><tr><td>100</td><td>Subclass marker (AcDbVbaProject)</td></tr><tr><td>90</td><td>Number of bytes of binary chunk data (contained in the group code 310 records that follow)</td></tr><tr><td>310</td><td>DXF: Binary object data (multiple entries containing VBA project data)</td></tr></table>

# WIPEOUTVARIABLES

The following group codes are used by WIPEOUTVARIABLES objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">WIPEOUTVARIABLES group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>0</td><td>Object name (WIPEOUTVARIABLES)</td></tr><tr><td>5</td><td>Handle</td></tr><tr><td>102</td><td>Start of persistent reactors group; always "#{ACAD_REACTORS}"</td></tr><tr><td>330</td><td>Soft-pointer ID/handle to owner dictionary. For a WIPEOUTVARIABLES object, this is always the ACAD_IMAGEVars entry of the named object dictionary</td></tr><tr><td>102</td><td>End of persistent reactors group; always “)”</td></tr><tr><td>100</td><td>Subclass marker (AcDbRasterVariables)</td></tr><tr><td>90</td><td>Class version 0</td></tr><tr><td>70</td><td>Display-image-frame flag: 0 = No frame; 1 = Display frame</td></tr></table>

# XRECORD

The following group codes are common to all xrecord objects. In addition to the group codes described here, see Common Group Codes for Objects on page 160. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

<table><tr><td colspan="2">Xrecord group codes</td></tr><tr><td>Group code</td><td>Description</td></tr><tr><td>100</td><td>Subclass marker (AcDbXrecord)</td></tr><tr><td>280</td><td>Duplicate record cloning flag (determines how to merge duplicate entries):
0 = Not applicable
1 = Keep existing
2 = Use clone
3 = &lt;xref&gt;$0&lt;$name&gt;
4 = $0&lt;$name&gt;
5 = Unmangle name</td></tr><tr><td>1-369 (except 5 and 105)</td><td>These values can be used by an application in any way</td></tr></table>

Xrecord objects are used to store and manage arbitrary data. They are composed of DXF group codes with "normal object" groups (that is, non-xdata group codes), ranging from 1 through 369 for supported ranges. This object is similar in concept to xdata but is not limited by size or order.

Xrecord objects are designed to work in such a way as to not offend releases R13c0 through R13c3. However, if read into a pre-R13c4 version of AutoCAD®, xrecord objects disappear.

# THUMBMAILIMAGE Section

This chapter presents the group codes that are found in the THUMBNALIMAGE section of a  $\mathrm{DXF^{TM}}$  file. This section exists only if a preview image has been saved with the DXF file.

# THUMBMAILIMAGE Section Group Codes

The following group codes are found in the THUMBMAILIMAGE section. For information about abbreviations and formatting used in this table, see Formatting Conventions in This Reference on page 2.

# THUMBMAILIMAGE group codes

# Group code Description

90 The number of bytes in the image (and subsequent binary chunk records)

310 Preview image data (multiple lines; 256 characters maximum per line)

# Drawing Interchange File Formats

# 9

This appendix describes the various file formats AutoCAD® uses to interchange drawing data with other applications. The formats presented are Drawing Interchange File (DXF™), binary DXF, Slide (SLD), and the Slide Library (SLB) file formats.

DXF files can be either ASCII or binary format. Because ASCII DXF files are more common than the binary format, the term DXF file is used to refer to ASCII DXF files and the term binary DXF file is used for the binary format.

# ASCII DXF Files

This section describes the format of ASCII DXF files. It contains information that is needed only if you write your own programs to process DXF files or work with entity information obtained by AutoLISP and ObjectARX applications.

# General DXF File Structure

Essentially, a DXF file is composed of pairs of codes and associated values. The codes, known as group codes, indicate the type of value that follows. Using these group code and value pairs, a DXF file is organized into sections composed of records, which are composed of a group code and a data item. Each group code and value are on their own line in the DXF file.

Each section starts with a group code 0 followed by the string SECTION. This is followed by a group code 2 and a string indicating the name of the section (for example, HEADER). Each section is composed of group codes and values that define its elements. A section ends with a 0 followed by the string ENDSEC.

It may be helpful to produce a DXF file from a small drawing, print it, and refer to it while reading the information presented in this section.

The overall organization of a DXF file is as follows:

- HEADER section. Contains general information about the drawing. It consists of an AutoCAD database version number and a number of system variables. Each parameter contains a variable name and its associated value.
- CLASSES section. Holds the information for application-defined classes, whose instances appear in the BLOCKS, ENTITIES, and OBJECTS sections of the database. A class definition is permanently fixed in class hierarchy.
TABLES section.Controls definitions for the following symbol tables: APPID (application identification table)

BLOCK_RECORD (block reference table)

DIMSTYLE (dimension style table)

LAYER(layer table)

LTYPE (linetype table)

STYLE (text style table)

UCS (user coordinate system table)

VIEW (view table)

VPORT (viewport configuration table)

■ BLOCKS section. Contains block definition and drawing entities that make up each block reference in the drawing.

- ENTITIES section. Contains the graphical objects (entities) in the drawing, including block references (insert entities).
- OBJECTS section. Contains the nongraphical objects in the drawing. All objects that are not entities or symbol table records or symbol tables are stored in this section. Examples of entries in the OBJECTS section are dictionaries that contain mline styles and groups.
THUMBNAIIMAGE section. Contains the preview image data for the drawing. This section is optional.

If you use the Select Objects option of the SAVE or SAVEAS command, the ENTITIES section of the resulting DXF file contains only the entities you select.

# Group Codes in DXF Files

Group codes and the associated values define a specific aspect of an object or entity. The line immediately following the group code is the associated value. This value can be a string, an integer, or a floating-point value, such as the  $X$  coordinate of a point. The lines following the second line of the group, if any, are determined by the group definition and the data associated with the group.

Special group codes are used as file separators, such as markers for the beginning and end of sections, tables, and the end of the file itself.

Entities, objects, classes, tables and table entries, and file separators are introduced with a 0 group code that is followed by a name describing the group.

The maximum DXF file string length is 256 characters. If your AutoCAD drawing contains strings that exceed this number, those strings are truncated during SAVE, SAVEAS, and WBLOCK. OPEN and INSERT fail if your DXF file contains strings that exceed this number.

# ASCII Control Characters in DXF Files

SAVEAS handles ASCII control characters in text strings by expanding the character into a caret (\^) followed by the appropriate letter. For example, an ASCII Control-G (BEL, decimal code 7) is written as ^G. If the text itself contains a caret character, it is expanded to caret, space (\^). OPEN and INSERT perform the complementary conversion.

# Header Group Codes in DXF Files

Applications can retrieve the values of these variables with the AutoLISP getvar function.

The following is an example of the HEADER section of a  $\mathrm{DXF}^{\mathrm{TM}}$  file:

```txt
0 Beginning of HEADER section
SECTION
2
HEADER
9 Repeats for each header variable \ $<variable>$  <group code>
```

```txt
<value>0ENDSEC
```

End of HEADER section

# Class Group Codes in DXF Files

The following is an example of the CLASSES section of a DXF file:

```txt
0 Beginning of CLASSES section
SECTION
2
CLASSES
0 Repeats for each entry
CLASS
1
<class dxf record>
2
<class name>
3
<app name>
90
<flag>
280
<flag>
281
<flag>
0 End of CLASSES section
ENDSEC
```

# Symbol Table Group Codes in DXF Files

The following is an example of the TABLES section of a DXF file.

```txt
0 Beginning of TABLES section
SECTION
2
TABLES
```

```txt
0 Common table group codes; repeats for TABLE each entry
2
<table type>
5
<handle>
100
AcDbSymbolTable
70
<max. entries>
0 Table entry data; repeats for each table record
<table type>
5
<handle>
100
AcDbSymbolTableRe- cord . . .
.
0 End of table
ENDTAB
0 End of TABLES section
ENDSEC
```

# Symbol Table Example

This DXF sequence represents three full objects: the symbol table itself plus two entries.

```txt
0 TABLE Indicates a symbol table entry 2 STYLE Text style symbol table entry. E rule that code 0 fully defines ty
```

<table><tr><td>5</td><td></td></tr><tr><td>1C</td><td>STYLE table handle; same as for entities and other objects</td></tr><tr><td>70</td><td></td></tr><tr><td>3</td><td>Maximum number of STYLE table records to follow (pre-Release 13 field)</td></tr><tr><td>1001</td><td></td></tr><tr><td>APP_X</td><td>APP_X has put xdata on a symbol table</td></tr><tr><td>1040</td><td></td></tr><tr><td>42.0</td><td>Just a single floating-point number</td></tr><tr><td>0</td><td></td></tr><tr><td>STYLE</td><td>Beginning of first element in the STYLE symbol table</td></tr><tr><td>5</td><td></td></tr><tr><td>3A</td><td>The first entry&#x27;s handle (DIMSTYLE entries will have 105 here)</td></tr><tr><td>2</td><td></td></tr><tr><td>ENTRY_1</td><td>The first entry&#x27;s text name</td></tr><tr><td>70</td><td></td></tr><tr><td>64</td><td>Standard flag values</td></tr><tr><td>40</td><td></td></tr><tr><td>.4</td><td>Text height</td></tr><tr><td>41</td><td></td></tr><tr><td>1.0</td><td>Width scale factor</td></tr></table>

Oblique angle

Text generation flags

Last height used

Primary font file name

Second entry begins. No xdata or persistent reactors on first entry

Second entry handle

Second entry text name

Other fields down to group code 3

Primary font file name and last object type—specific group

This entry has two persistent reactors

```txt
3C2 Soft ID to first reactor object
330
41B Soft ID to first reactor object
102
} Indicates the end of the reactor set
1001
APP_1 Xdata attached to this entry
1070
45
1001
APP_2
1004
18A5B3EF2C199A
0
UCS Start of UCS table (and end of previo cord and table)
```

# Blocks Group Codes in DXF Files

The following is an example of the BLOCKS section of a DXF file:

```sql
0 Beginning of BLOCKS section
SECTION
2
BLOCKS
0 Begins each block entry (a block entity definition)
```

```txt
BLOCK
5 <handle>
100 AcDbEntity
8 <layer>
100 AcDbBlockBegin
2 <block name>
70 <flag>
10 <X value>
20 <Y value>
30 <Z value>
3 <block name>
1 <xref path>
0 One entry for each entity definition within <entity type> the block . . <data> .
0 End of each block entry (an endblk entity ENDBLK definition)
5 <handle>
100 AcDbBlockEnd
0 End of BLOCKS section
ENDSEC
```

# Entity Group Codes in DXF Files

The following is an example of the ENTITIES section of a DXF file:

```txt
0 Beginning of ENTITIES section
SECTION
2
ENTITIES
0 One entry for each entity definition
<entity type>
5
<handle>
330
<pointer to owner>
100
AcDbEntity
8
<layer>
100
AcDb<classname>
. . <data>
.
0 End of ENTITIES section
ENDSEC
```

# Object Group Codes in DXF Files

The following is an example of the OBJECTS section of a DXF file:

```txt
0 Beginning of OBJECTS section
SECTION
2
OBJECTS
0 Beginning of named object dictionary (root
DICTIONARY dictionary object)
5
<handle>
100
```

```txt
AcDbDictionary
3 Repeats for each entry <dictionary name>
350 <handle of child>
0 Groups of object data <object type> . <data> 0 End of OBJECTS section ENDSEC
```

# Writing a DXF Interface Program

Writing a program that communicates with AutoCAD by means of the DXF file appears more difficult than it actually is. The DXF format makes it easy to ignore information you don't need, while reading the information you do need.

# Reading a DXF File

The following example is a simple Visual Basic 6 program that reads a DXF file and extracts specific codes and values from a given object in a given section.

```vba
'ReadDXF extracts specified code/value pairs from a DXF file. ' This function requires four string parameters, a valid DXF ' file name, a DXF section name, the name of an object in that ' section, and a comma delimited list of codes.
Function ReadDXF( _ ByVal dxfFile As String, ByVal strSection As String, ByVal strObject As String, ByVal strCodeList As String Dim tmpCode, lastObj As String Open dxfFile For Input As #1 Get the first code/value pair codes  $=$  ReadCodes Loop through the whole file until the "EOF" line While codes(1)  $<  >$  "EOF If the group code is  $"0"$  and the value is 'SECTION' If codes(0)  $=$  "0" And codes(1)  $=$  "SECTION" Then This must be a new section, so get the next code/value pair. codes  $=$  ReadCodes() If this section is the right one.. If codes(1)  $=$  strSection Then Get the next code/value pair and .. codes  $=$  ReadCodes Loop through this section until the 'ENDSEC' While codes(1)  $<  >$  "ENDSEC" While in a section, all  $"0"$  codes indicate an object. If you find a  $"0"$  store the object name for future use. If codes(0)  $=$  "0" Then lastObj  $=$  codes(1) If this object is one you're interested in If lastObj  $=$  strObject Then Surround the code with commas tmpCode  $=$  ", & codes(0) & ", If this code is in the list of codes .. If InStr(strCodeList, tmpCode) Then Append the return value. ReadDXF  $=$  ReadDXF &_ codes(0) & "=" & codes(1) & vbCrLf End If End If ' Read another code/value pair codes  $=$  ReadCodes Wend
```

```vba
End If Else codes  $=$  ReadCodes End If Wend Close #1
End Function 'ReadCodes reads two lines from an open file and returns a two item array, a group code and its value. As long as a DXF file is read two lines at a time, all should be fine. However, to make your code more reliable, you should add some additional error and other checking.
Function ReadCodes() As Variant Dim codeStr, valStr As String Line Input #1, codeStr Line Input #1, valStr 'Trim the leading and trailing space from the code ReadCodes  $=$  Array(Trim(codeStr), valStr)
End Function
```

# Writing a DXF File

Writing a program that creates a DXF file can be more difficult than one that reads a DXF file, because you must maintain consistency within the drawing in order for AutoCAD to find the file acceptable. AutoCAD lets you omit many items in a DXF file and still obtain a usable drawing.

The entire HEADER section can be omitted if you don't set header variables.

- Any of the tables in the TABLES section can be omitted if you don't need to make entries, and the entire TABLES section can be dropped if nothing in it is required.
If you define any linetypes in the LTYPE table, this table must appear before the LAYER table.
If no block definitions are used in the drawing, the BLOCKS section can be omitted.
If present, the BLOCKS section must appear before the ENTITIES section.

- Within the ENTITIES section, you can reference layer names even though you haven't defined them in the LAYER table. Such layers are automatically created with color 7 and the CONTINUOUS linetype.
The EOF item must be present at the end of file.

The following Visual Basic 6 subroutine constructs a DXF file representing a polygon.

' WriteDXFPolygon creates a minimal DXF file that only contains
' the ENTITIES section. This subroutine requires five parameters,
' the DXF file name, the number of sides for the polygon, the X
' and Y coordinates for the bottom end of the right-most side
' (it starts in a vertical direction), and the length for each
' side. Note that because this only requests 2D points, it does
' not include the Z coordinates (codes 30 and 31). The lines are
placed on the layer "Polygon."

```txt
Sub WriteDXFPolygon( _
    dxfFile As String, iSides As Integer, _
    dblX As Double, dblY As Double, dblLen As Double)
Dim i As Integer
Dim dblA1, dblA, dblPI, dblNX, dblNY As Double
Open dxfFile For Output As #1
Print #1, 0
Print #1, "SECTION"
Print #1, 2
Print #1, "ENTITIES"
dblPI = Atn(1) * 4
dblA1 = (2 * dblPI) / iSides
dblA = dblPI / 2
For i = 1 To iSides
    Print #1, 0
    Print #1, "LINE"
    Print #1, 8
    Print #1, "Polygon"
    Print #1, 10
    Print #1, dblX
    Print #1, 20
    Print #1, dblY
    dblNX = dblLen * CosdblA) + dblX
    dblNY = dblLen * SindblA) + dblY
    Print #1, 11
    Print #1, dblNX
    Print #1, 21
    Print #1, dblNY
    dblX = dblNX
    dblY = dblNY
    dblA = dblA + dblA1
Next i
Print #1, 0
Print #1, "ENDSEC"
```

```txt
Print #1, 0
Print #1, "EOF"
Close #1
End Sub
```

As long as a properly formatted item appears on the line on which the data is expected, DXFIN accepts it. (Of course, string items should not have leading spaces unless these are intended to be part of the string.) This BASIC program takes advantage of this flexibility in input format and does not generate a file exactly like one generated by AutoCAD.

In the case of an error in using DXFIN to load, AutoCAD reports the error with a message indicating the nature of the error and the last line processed in the DXF file before the error was detected. This may not be the line on which the error occurred, especially in the case of errors such as the omission of required groups.

# Binary DXF Files

The ASCII DXF file format is a complete representation of an AutoCAD drawing in an ASCII text form, and is easily processed by other programs. In addition, AutoCAD can produce or read a binary form of the full DXF file and accept limited input in another binary file format.

The SAVE and SAVEAS commands provide a Binary option that writes binary DXF files. Such a file contains all the information present in an ASCII DXF file but in a more compact form that takes about 25 percent less file space. It can be read and written more quickly (typically, five times faster) by AutoCAD. Unlike ASCII DXF files, which entail a trade-off between size and floating-point accuracy, binary DXF files preserve the accuracy in the drawing database. (AutoCAD Release 10 was the first version to support this form of DXF file; it cannot be read by older versions.)

A binary DXF file begins with a 22-byte sentinel consisting of the following:

```txt
AutoCAD Binary DXF<CR><LF><SUB><NULL>
```

Following the sentinel are pairs (group, value) as in an ASCII DXF file but represented in binary form. The group code is a 2-byte binary value (1 byte in DXF files prior to AutoCAD Release 14), and the value that follows is one of the following:

A 2-byte integer with the least significant byte first and the most significant byte last

An 8-byte IEEE double-precision floating-point number stored with the least significant byte first and the most significant byte last
An ASCII string terminated by a 0 (NULL) byte

The type of data following a group is determined from the group code by the same rules used in decoding ASCII DXF files. Translation of angles to degrees and dates to fractional Julian date representation is performed for binary files as well as for ASCII DXF files. The comment group, 999, is not used in binary DXF files.

Extended data group codes are represented in binary DXF as a single byte with the value 255, followed by a 2-byte integer value containing the actual group code, followed by the actual value.

Extended data long values (group code 1071) occupy 4 bytes of data. Extended data binary chunks (group code 1004) are represented as a single-byte unsigned integer length, followed by the specified number of bytes of chunk data. For example, to transfer an extended data long group, the following values would appear, occupying 1, 2, and 4 bytes respectively.

<table><tr><td>255</td><td>Escape group code</td></tr><tr><td>1071</td><td>True group code</td></tr><tr><td>999999</td><td>Value for the 1071 group code</td></tr></table>

SAVEAS writes binary DXF files with the same file type (.dxf) as for ASCII DXF files. The OPEN and INSERT commands automatically recognize a binary file by means of its sentinel string. You need not identify it as a binary file.

If the OPEN and INSERT commandsencounter an error in a binary DXF file, AutoCAD reports the byte address within the file where the error was detected.

# Slide Files

NOTE This information is for experienced programmers, and is subject to change without notice.

AutoCAD slide files are screen images written by the MSLIDE command and read by the VSLIDE command. This section describes the format of slide files for the benefit of developers who wish to incorporate support for slides into their programs.

A slide file consists of a header portion (31 bytes) and one or more data records of variable length. All coordinates and sizes written to the slide file reflect the drawing area of the display device from which the slide was created, with

point  $(0,0)$  located at the lower-left corner of the drawing area. For AutoCAD Release 9 and later, the slide file header consists of the following fields:

Slide file header

<table><tr><td>Field</td><td>Bytes</td><td>Description</td></tr><tr><td>ID string</td><td>17</td><td>“AutoCAD Slide” CR LF ^Z NUL</td></tr><tr><td>Type indicator</td><td>1</td><td>Currently set to 56 (decimal)</td></tr><tr><td>Level indicator</td><td>1</td><td>Currently set to 2</td></tr><tr><td>High X dot</td><td>2</td><td>Width of the graphics area: 1, in pixels</td></tr><tr><td>High Y dot</td><td>2</td><td>Height of the graphics area: 1, in pixels</td></tr><tr><td>Aspect ratio</td><td>4</td><td>Drawing area aspect ratio (horizontal size/vertical size in inches), scaled by 10,000,000. This value is always written with the least significant byte first</td></tr><tr><td>Hardware fill</td><td>2</td><td>Either 0 or 2 (value is unimportant)</td></tr><tr><td>Test number</td><td>2</td><td>A number (1234 hex) used to determine whether all 2-byte values in the slide were written with the high-order byte first (Intel 8086-family CPUs) or the low-order byte first (Motorola 68000-family CPUs)</td></tr></table>

Data records follow the header. Each data record begins with a 2-byte field whose high-order byte is the record type. The remainder of the record may be composed of 1-byte or 2-byte fields as described in the following table. To determine whether the 2-byte fields are written with the high-order byte first or the low-order byte first, examine the Test number field of the header that is described in the previous table.

Slide file data records

<table><tr><td>Record type (hex)</td><td>Bytes</td><td>Meaning</td><td>Description</td></tr><tr><td>00-7F</td><td>8</td><td>Vector</td><td>The from-X coordinate for an ordinary vector. From-Y, to-X, and to-Y follow, in that order, as 2-byte values. The from- point is saved as the last point</td></tr><tr><td>80-FA</td><td>—</td><td>Undefined</td><td>Reserved for future use</td></tr></table>

Slide file data records

<table><tr><td>Record type (hex)</td><td>Bytes</td><td>Meaning</td><td>Description</td></tr><tr><td>FB</td><td>5</td><td>Offset vector</td><td>The low-order byte and the following three bytes specify the endpoints (from-X, from-Y, to-X, to-Y) of a vector, in terms of offsets (-128 to +127) from the saved last point. The adjusted from- point is saved as the last point for use by subsequent vectors</td></tr><tr><td>FC</td><td>2</td><td>End of file</td><td>The low-order byte is 00</td></tr><tr><td>FD</td><td>6</td><td>Solid fill</td><td>The low-order byte is always zero. The following two 2-byte values specify the X and Y coordinates of one vertex of a polygon to be solid-filled. Three to ten such records occur in sequence. A Solid fill record with a negative Y coordinate indicates the start or end of such a flood sequence. In the start record, the X coordinate indicates the number of vertex records to follow</td></tr><tr><td>FE</td><td>3</td><td>Common endpoint vector</td><td>This is a vector starting at the last point. The low-order byte and the following byte specify to-X and to-Y in terms of offsets (-128 to +127) from the saved last point. The adjusted to- point is saved as the last point for use by subsequent vectors</td></tr><tr><td>FF</td><td>2</td><td>New color</td><td>Subsequent vectors are to be drawn using the color number indicated by the low-order byte</td></tr></table>

If a slide contains any vectors at all, a New color record will be the first data record. The order of the vectors in a slide and the order of the endpoints of those vectors may vary.

For example, the following is an annotated hex dump of a simple slide file created on an IBM PC/AT with an IBM Enhanced Graphics Adapter. The slide consists of a white diagonal line from the lower-left corner to the upper-right

corner of the drawing area, a green vertical line near the lower-left corner, and a small red rectangle at the lower-left corner.

```txt
41 75 74 6F 43 41 ID string ("AutoCAD Slide" CR LF ^Z NUL)
44 20 53 6C 69 64
65 0D 0A 1A 00
56 Type indicator (56)
02 Level indicator (2)
3C 02 High X dot (572)
24 01 High Y dot (292)
OB 80 DF 00 Aspect ratio (14,647,307 / 10,000,000 = 1.46)
02 00 Hardware fill (2)
34 12 Test number (1234 hex)
07 FF New color (7 = white)
3C 02 24 01 00 00 00 00 Vector from 572,292 to 0,0. 572,292 becomes "last" point
3 FF New color (3 = green)
OF 00 32 00 OF 00 13 00 Vector from 15,50 to 15,19. \x1115,50 becomes "last" point
01 FF New color (1 = red)
12 FB E7 12 CE Offset vector from 15+18,50-25 (33,25) to 15+18, 50-50 (33,0). 33,25 becomes "last" point
DF FE 00 Common-endpoint vector from 33,25 to 33-33,25+0 (0,25). 0,25 becomes "last" point
00 FE E7 Common-endpoint vector from (0,25) to 0+0,25-25 (0,0). 0,0 becomes "last" point
21 FE 00 Common-endpoint vector from (0,0) to 0+33,0+0 (33,0).33,0 becomes "last" point
00 FC End of file
```

# Old Slide Header

The slide format described in the previous section is produced by AutoCAD Release 9 and later, and is portable among all computers running AutoCAD Release 9 or later. Previous versions of AutoCAD (as well as AutoShade® 1.0

and AutoSketch® 1.02) produce slides with a somewhat different header, as shown in the following table.

# Old slide file header

<table><tr><td>Field</td><td>Bytes</td><td>Description</td></tr><tr><td>ID string</td><td>17</td><td>“AutoCAD Slide” CR LF ^Z NUL</td></tr><tr><td>Type indicator</td><td>1</td><td>56 (decimal)</td></tr><tr><td>Level indicator</td><td>1</td><td>1 (old format)</td></tr><tr><td>High X dot</td><td>2</td><td>Width of the drawing area: 1, in pixels</td></tr><tr><td>High Y dot</td><td>2</td><td>Height of the drawing area: 1, in pixels</td></tr><tr><td>Aspect ratio</td><td>8</td><td>Drawing area aspect ratio (horizontal size/vertical size in inches), written as a floating-point number</td></tr><tr><td>Hardware fill</td><td>2</td><td>Either 0 or 2 (value is unimportant)</td></tr><tr><td>Filler byte</td><td>1</td><td>Unused</td></tr></table>

Note that the old-format header does not contain a test number field. The floating-point aspect ratio value and all 2-byte integers are written in the native format of the CPU that was used to create the file (for 8086-family CPUs, IEEE double-precision, and low-order byte first). Old-format slide files are not portable across machine types, but they can be read by any version of AutoCAD running on the same CPU type as the CPU with which the slide was created.

# Slide Library Files

This section describes the format of AutoCAD slide libraries (Release 9 and later) for the benefit of developers who wish to incorporate support for slide libraries into their programs.

The general format of a slide library is as follows:

```txt
"AutoCAD Slide Library 1.0" CR LF ^Z NUL NUL NUL NUL Header (32 bytes) One or more slide directory entries (36 bytes each) One or more slides (variable length)
```

Slide directory entries have the following format:

Slide name (NUL terminated) (32 bytes)
Address of slide within library file (4 bytes)

The slide address is always written with the low-order byte first. Each slide to which the directory points is a complete slide file as described in the previous section. The end of the slide directory is signified by an entry with a null slide name (first byte is NUL). A slide library can contain a mixture of old-format and new-format slides.

# Advanced DXF Issues

# 10

This appendix discusses the advanced concepts related to  $\mathrm{DXF}^{\mathrm{TM}}$  group codes.

# Database Objects

AutoCAD® drawings consist largely of structured containers for database objects. Database objects each have the following features:

A handle whose value is unique to the drawing/DXF file, and is constant for the lifetime of the drawing. This format has existed since AutoCAD Release 10, and as of AutoCAD Release 13, handles are always enabled.
An optional xdata table, as entities have had since AutoCAD Release 11.
An optional persistent reactor table.
An optional ownership pointer to an extension dictionary which, in turn, owns subobjects placed in it by an application.

Symbol tables and symbol table records are database objects and, thus, have a handle. They can also have xdata and persistent reactors in their DXF records.

# Persistent Inter-Object Reference Handles

A set of group code ranges permits objects to directly specify references to other objects within the same drawing/DFX file. Four ranges are provided for the four types of reference handles that you can specify:

Soft-pointer handle
Hard-pointer handle

Soft-owner handle
Hard-owner handle

These handle types are manifested as entity names in AutoLISP®, as ads_name values in ObjectARX® and as like-named classes derived from ObjectARX. These values are always maintained in insert, xref, and wblock operations such that references between objects in a set being copied are updated to point to the copied objects, while references to other objects remain unchanged.

Also, a group code range for "arbitrary" handles is defined to allow convenient storage of handle values that are not converted to entity names and then translated in insert, xref, or wblock.

NOTE If you use 1005 xdata group codes to store handles, they are treated as soft-pointer handles, which means that when groups of objects are copied or inserted into another drawing, references between the involved objects are translated. Although 1005 xdata items are always returned as handles in AutoLISP and ObjectARX, all of the reference handle group code ranges are represented as "entity names" in AutoLISP and as ads_name structures in ObjectARX.

# Pointer and Ownership References

A pointer is a reference that indicates usage, but not possession or responsibility, for another object. A pointer reference means that the object uses the other object in some way, and shares access to it.

An ownership reference means that an owner object is responsible for the objects for which it has an owner handle. Ownership references direct the writing of entire DWG and DXF files in a generic manner, such as beginning from a few key root objects.

An object can have any number of pointer references associated with it, but it can have only one owner.

# Hard and Soft References

Hard references, whether they are pointer or owner, protect an object from being purged. Soft references do not.

In AutoCAD, block definitions and complex entities are hard owners of their elements. A symbol table and dictionaries are soft owners of their elements.

Polyline entities are hard owners of their vertex and seqend entities. Insert entities are hard owners of their attrib and seqend entities.

When establishing a reference to another object, it is recommended that you think about whether the reference should protect an object from the PURGE command.

# Arbitrary Handles

Arbitrary handles are distinct in that they are not translated to session-persistent identifiers internally, or to entity names in AutoLISP, and so on. They are stored as handles. When handle values are translated in drawing-merge operations, arbitrary handles are ignored.

In all environments, arbitrary handles can be exchanged for entity names of the current drawing by means of the handent functions. A common usage of arbitrary handles is to refer to objects in external DXF and DWG files.

# 1005 Group Codes

1005 xdata group codes have the same behavior and semantics as soft pointers, which means that they are translated whenever the host object is merged into a different drawing. However, 1005 items are not translated to session-persistent identifiers or internal entity names in AutoLISP and ObjectARX. They are stored as handles.

# Subclass Markers

When filing a stream of group data, a single object may be composed of several filer members, one for each level of inheritance where filing is done. Since derived classes and levels of inheritance can evolve separately, the data of each class filer member must be segregated from other members. This is achieved using subclass markers.

All class filer members are expected to precede their class-specific portion of instance data with a "subclass" marker—a 100 group code followed by a string with the actual name of the class. This does not affect the state needed to define the object's state, but it provides a means for the DXF file parsers to direct the group codes to the corresponding application software.

For example, an object that has data from different derived classes would be represented as follows:

```txt
999
FOOGRANDCHILD, defined by class AcDbSonOfSonOfFoo, which
999 is derived from AcDbSonOfFoo 0
FOOGRANDCHILD 5
C2
100
AcDbFoo
999
Uses 10/20/30 group codes 10
1.1
20
2.3
30
7.3
100
AcDbSonOfFoo
999
Also uses 10/20/30 group codes, for a different purpose 10
1.1
20
2.3
30
7.3
100
AcDbSonOfSonOfFoo
999
Also uses 10/20/30 group codes, for yet another purpose 10
13.2
20
23.1
30
31.2
999
Now for the Xdata
1001
APP_1
1070
```

45

1001

APP_2

1004

18A5B3EF2C199A

# Extension Dictionary and Persistent Reactors

The extension dictionary is an optional sequence that stores the handle of a dictionary object that belongs to the current object, which in turn may contain entries. This facility allows attachment of arbitrary database objects to any database object. Any object or entity may have this section.

Persistent reactors are an optional sequence that stores object handles of objects registering themselves as reactors on the current object. Any object or entity may have this section.

# Extended Data

Extended data (xdata) is created by AutoLISP or ObjectARX applications. If an entity contains extended data, it follows the entity's normal definition data. The group codes 1000 through 1071 describe extended data. The following is an example of an entity containing extended data in DXF format.

Normal entity definition data:

```txt
0
INSERT
5
F11
100
AcDbEntity
8
TOP
100
AcDbBlockReference
2
BLOCK_A
10
0.0
20
0.0
30
0.0
```

Extended entity definition data:

```txt
1001
AME_SOL
1002
{
1070
0
1071
1.95059E+06
1070
519
1010
2.54717
1020
2.122642
1030
2.049201
1005
ECD
1005
EE9
1005
0
1040
0.0
1040
1.0
1000
MILD_STEL
```

The group code 1001 indicates the beginning of extended data. In contrast to normal entity data, with extended data the same group code can appear multiple times, and order is important.

Extended data is grouped by registered application name. Each registered application group begins with a 1001 group code, with the application name as the string value. Registered application names correspond to APPID symbol table entries.

An application can use as many APPID names as needed. APPID names are permanent, although they can be purged if they aren't currently used in the drawing. Each APPID name can have no more than one data group attached to each entity. Within an application group, the sequence of extended data groups and their meaning is defined by the application.

The extended data group codes are listed in the following table.

<table><tr><td colspan="3">Extended data group codes and descriptions</td></tr><tr><td>Entity name</td><td>Group code</td><td>Description</td></tr><tr><td>String</td><td>1000</td><td>Strings in extended data can be up to 255 bytes long (with the 256th byte reserved for the null character)</td></tr><tr><td rowspan="2">Application name</td><td rowspan="2">1001 also a string value</td><td>Application names can be up to 31 bytes long (the 32nd byte is reserved for the null character)</td></tr><tr><td>NOTE Do not add a 1001 group into your extended data because AutoCAD assumes it is the beginning of a new application extended data group</td></tr><tr><td>Control string</td><td>1002</td><td>An extended data control string can be either “{” or “}”. These braces enable applications to organize their data by subdividing the data into lists. The left brace begins a list, and the right brace terminates the most recent list. Lists can be nested When AutoCAD reads the extended data for a particular application, it checks to ensure that braces are balanced</td></tr><tr><td>Layer name</td><td>1003</td><td>Name of the layer associated with the extended data</td></tr><tr><td>Binary data</td><td>1004</td><td>Binary data is organized into variable-length chunks. The maximum length of each chunk is 127 bytes. In ASCII DXF files, binary data is represented as a string of hexadecimal digits, two per binary byte</td></tr><tr><td rowspan="2">Database handle</td><td rowspan="2">1005</td><td>Handles of entities in the drawing database</td></tr><tr><td>NOTE When a drawing with handles and extended data handles is imported into another drawing using INSERT, INSERT *, XREF Bind, XBIND, or partial OPEN, the extended data handles are translated in the same manner as their corresponding entity handles, thus maintaining their binding. This is also done in the EXPLODE block operation or for any other AutoCAD operation. When AUDIT detects an extended data handle that doesn&#x27;t match the handle of an entity in the drawing file, it is considered an error. If AUDIT is fixing entities, it sets the handle to 0</td></tr><tr><td>3 reals</td><td>1010, 1020, 1030</td><td>Three real values, in the order X, Y, Z. They can be used as a point or vector record. AutoCAD never alters their value</td></tr></table>

Extended data group codes and descriptions

<table><tr><td>Entity name</td><td>Group code</td><td>Description</td></tr><tr><td>World space position</td><td>1011, 1021, 1031</td><td>Unlike a simple 3D point, the world space coordinates are moved, scaled, rotated, and mirrored along with the parent entity to which the extended data belongs. The world space position is also stretched when the STRETCH command is applied to the parent entity and this point lies within the select window</td></tr><tr><td>World space displacement</td><td>1012, 1022, 1032</td><td>Also a 3D point that is scaled, rotated, and mirrored along with the parent (but is not moved or stretched)</td></tr><tr><td>World direction</td><td>1013, 1023, 1033</td><td>Also a 3D point that is rotated and mirrored along with the parent (but is not moved, scaled, or stretched)</td></tr><tr><td>Real</td><td>1040</td><td>A real value</td></tr><tr><td>Distance</td><td>1041</td><td>A real value that is scaled along with the parent entity</td></tr><tr><td>Scale factor</td><td>1042</td><td>Also a real value that is scaled along with the parent. The difference between a distance and a scale factor is application-defined</td></tr><tr><td>Integer</td><td>1070</td><td>A 16-bit integer (signed or unsigned)</td></tr><tr><td>Long</td><td>1071</td><td>A 32-bit signed (long) integer</td></tr></table>

# Object Coordinate Systems (OCS)

To save space in the drawing database (and in the DXF file), the points associated with each entity are expressed in terms of the entity's own object coordinate system (OCS). With OCS, the only additional information needed to describe the entity's position in 3D space are the 3D vector describing the  $Z$  axis of the OCS and the elevation value.

For a given  $Z$  axis (or extrusion) direction, there are an infinite number of coordinate systems, defined by translating the origin in 3D space and by rotating the  $X$  and  $Y$  axes around the  $Z$  axis. However, for the same  $Z$  axis direction, there is only one OCS. It has the following properties:

Its origin coincides with the WCS origin.

- The orientation of the  $X$  and  $Y$  axes within the  $XY$  plane is calculated in an arbitrary but consistent manner. AutoCAD performs this calculation using the arbitrary axis algorithm (see Arbitrary Axis Algorithm on page 252).

For some entities, the OCS is equivalent to the WCS, and all points (DXF groups 10-37) are expressed in world coordinates. See the following table.

Coordinate systems associated with an entity type

<table><tr><td>Entities</td><td>Notes</td></tr><tr><td>3D entities such as line, point, 3dface, 3D polyline, 3D vertex, 3D mesh, 3D mesh vertex</td><td>These entities do not lie in a particular plane. All points are expressed in world coordinates. Of these entities, only lines and points can be extruded. Their extrusion direction can differ from the world Z axis</td></tr><tr><td>2D entities such as circle, arc, solid, trace, text, attrib, attdef, shape, insert, 2D polyline, 2D vertex, lwpolyline, hatch, image</td><td>These entities are planar in nature. All points are expressed in object coordinates. These entities can be extruded. Their extrusion direction can differ from the world Z axis</td></tr><tr><td>Dimension</td><td>Some of a dimension&#x27;s points are expressed in WCS and some in OCS</td></tr><tr><td>Viewport</td><td>Expressed in world coordinates</td></tr></table>

Once AutoCAD has established the OCS for a given entity, the OCS works as follows: The elevation value stored with an entity indicates how far to shift the  $XY$  plane along the  $Z$  axis (from the WCS origin) to make it coincide with the plane that contains the entity. How much of this is the user-defined elevation is unimportant.

Any 2D points entered through the UCS are transformed into the corresponding 2D points in the OCS, which is shifted and rotated with respect to the UCS.

These are a few ramifications of this process:

- You cannot reliably find out what UCS was in effect when an entity was acquired.
- When you enter the  $XY$  coordinates of an entity in a given UCS and then do a SAVEAS, you probably won't recognize those  $XY$  coordinates in the DXF file. You must know the method by which AutoCAD calculates the  $X$  and  $Y$  axes in order to work with these values.
The elevation value stored with an entity and output in DXF files is a sum of the  $Z$ -coordinate difference between the UCS  $XY$  plane and the OCS  $XY$

plane, and the elevation value that the user specified at the time the entity was drawn.

# Arbitrary Axis Algorithm

The arbitrary axis algorithm is used by AutoCAD internally to implement the arbitrary but consistent generation of object coordinate systems for all entities that use object coordinates.

Given a unit-length vector to be used as the  $Z$  axis of a coordinate system, the arbitrary axis algorithm generates a corresponding  $X$  axis for the coordinate system. The  $Y$  axis follows by application of the right-hand rule.

The method is to examine the given  $Z$  axis (also called the normal vector). If it is close to the positive or negative world  $Z$  axis, cross the world  $Y$  axis with the given  $Z$  axis to arrive at the arbitrary  $X$  axis. If it is not close, cross the world  $Z$  axis with the given  $Z$  axis to arrive at the arbitrary  $X$  axis. The boundary at which the decision is made was chosen to be both inexpensive to calculate and completely portable across machines. This is achieved by having a sort of "square" polar cap, the bounds of which are 1/64, which is precisely specifiable in six decimal-fraction digits and in six binary-fraction bits.

The algorithm does the following (all vectors are assumed to be in 3D space and specified in the world coordinate system):

```txt
Let the given normal vector be called N.
Let the world Y axis be called Wy, which is always (0,1,0).
Let the world Z axis be called Wz, which is always (0,0,1).
```

Here we are looking for the arbitrary  $X$  and  $Y$  axes to go with the normal  $N$ . They will be called  $Ax$  and  $Ay$ .  $N$  could also be called  $Az$  (the arbitrary  $Z$  axis) as follows:

```txt
If (abs  $(\mathrm{Nx}) < 1 / 64)$  and (abs  $(\mathrm{Ny}) < 1 / 64)$  then
Ax = Wy X N (where "X" is the cross-product operator). Otherwise,
Ax = Wz X N.
Scale Ax to unit length.
```

The method of getting the Ay vector is as follows:

```txt
Ay = NX Ax. Scale Ay to unit length.
```

# Index

\*Model_Space block definition 59

*Paper_Space block definition 59

32-bit integer values\ 152

2D entities, coordinate systems associated with 251

3D entities, coordinate systems associated with 251

3dface group codes 64

3dsolid group codes 65

# A

acad-proxy-entity group codes 65

ACAD_PROXY_OBJECT group codes 161

ACADMAINTVER DXF header variable 11

ACADVER DXF header variable 11

ACDBDCTIONARYWDFLT group codes 161

AcDbMentalRayRenderSettings 194

ACDBPLACEHOLDER group codes 162

AcDbRenderGlobal 197

AcDbRenderSettings 194

ACFD_FIELD_VALUE key 169

aligned dimension group codes 80

ambient color, group codes 180

ANGBASE DXF header variable 11

ANGDIR DXF header variable 11

angular dimension group codes 83

anonymous blocks 57

APPID group codes 38

xdata groupings and 248

application-defined object types 159

arbitrary axis algorithm 252

arbitrary handles 242

arc edge data for hatch entities 92

arc group codes 66

ASCII control characters in DXF files 219

ASCII DXF files

about 217

vs. binary DXF files 234

BLOCKS section (example) 224

CLASSES section (example) 220

control character handling 219

ENTITIES section (example) 226

HEADER section (example) 219

maximum file string length 219

OBJECTS section (example) 226

reading (example) 228

sections of 217

structure of 217

TABLES section (example) 220

writing (example) 230

attdef group codes 67

ATTMODE DXF header variable 12

attrib group codes 72

AUNITS DXF header variable 12

AUPREC DXF header variable 12

AutoLISP

arbitrary handles and 243

entnext function output for ole2frame

entity (example) 123

group code 1005 xdata items

and 243

handent function 243

reference handles and 242

# B

block definitions

about 57

Model_Space and Paper_Space 59

UCS/WCS and 59

block group codes 58

block reference (insert) group codes 97

BLOCK section (DXF files), about 2

block table handles 57

BLOCK_RECORD group codes 38

BLOCKS section

about 57,218

example of 224

group codes in 57

and writing a DXF file 230

blocks, anonymous 57

body group codes 77

Boolean flags, group code range 4

borders (in tables), group codes 142

boundary path data for hatch entities 90

boundary path data for hatch entities, group codes 90

bump maps, group codes 183

binaryDXFfiles 1,217,234

# C

$\mathrm{C + + }$  class names, default class values 32

CECOLOR DXF header variable 12

CELTSCALE DXF header variable 12

CELTYPE DXF header variable 12

CELWEIGHT DXF header variable 12

CEPSNID DFX header variable 12

CEPSNTYPE DXF header variable 12

CHAMFERA DXF header variable 12

CHAMFERB DXF header variable 12

CHAMFERC DXF header variable 12

CHAMFERD DXF header variable 12

child fields, group codes 169

circle group codes 77

CLASSES section

about 31,218

default class values by DXF record

name and C++ class

name 32

group codes in 32

CLAYER DXF header variable 12

CMLJUST DXF header variable 12

CMLSCALE DXF header variable 13

CMLSTYLE DXF header variable 13

codes, group. See group codes (DXF files)

color styles (in tables), group codes 206

column headings (in tables), suppression of 206

columns and rows (in tables), group codes 139

comments, group code 4, 9

common entity group codes 61

control character handling 219

control strings 7

conventions used in this reference 2

coordinate systems associated with entity types 251

CSHADOWHeader variable 13

# D

database objects 241

DATATABLE group codes 163

default class values by DXF record name and C++ class name 32

deleted items in symbol tables 35

DGNUNDERLAY 147

diameter dimension group codes 82

dictionaries, named object 159

DICTIONARY group codes 164

DICTIONARYVAR group codes 166

diffuse color, group codes 180

diffuse maps, group codes 180

DIMADEC DXF header variable 13

DIMALT DXF header variable 13

DIMALTD DXF header variable 13

DIMALTF DXF header variable 13

DIMALTRND DXF header variable 13

DIMALTTD DXF header variable 13

DIMALTZ DXF header variable 13

DIMALTU DXF header variable 13

DIMALTZ DXF header variable 13

DIMAPOSTDXFheadervariable 14

DIMASO DXF header variable 14

DIMASSOC DXF header variable 14

DIMASZDXFheadervariable 14

DIMATFIT DXF header variable 14

DIMAUNIT DXF header variable 14

DIMAZIN DXF header variable 14

DIMBLK DXF header variable 15

DIMBLK1 DXF header variable 15

DIMBLK2DXFheadervariable 15

DIMCENDXFheadervariable 15

DIMCLRD DXF header variable 15

DIMCLRE DXF header variable 15

DIMCLRT DXF header variable 15

DIMDEC DXF header variable 15

DIMMLEDXFheadervariable 15

DIMDLIXFheadervariable 15

DIMDSEP DXF header variable 15

dimension entities, coordinate systems

associated with 251

dimension group codes 78

aligned 80

angular 83

common 78

diameter 82

linear 81

ordinate 85

radial 82

rotated 81

dimension style overrides 86

DIMEXE DXF header variable 15

DIMEXO DXF header variable 15

DIMFAC DXF header variable 15

DIMGAP DXF header variable 15

DIMJUST DXF header variable 15

DIMLDRBLK DXF header variable 16

DIMLFAC DXF header variable 16

DIMLIM DXF header variable 16

DIMLUNIT DXF header variable 16

DIMLWD DXF header variable 16

DIMLWE DXF header variable 16

DIMPOSTDXFheadervariable 16

DIMRND DXF header variable 16

DIMSAH DXF header variable 16

DIMSCALE DXF header variable 16

DIMSD1 DXF header variable 16

DIMSD2 DXF header variable 17

DIMSE1DXFheadervariable 17

DIMSE2DXFheadervariable 17

DIMSHO DXF header variable 17

DIMSOXD DXF header variable 17

DIMSTYLE table handle code 36

DIMSTYLEDXFheadervariable 17

DIMSTYLE group codes 39

DIMSTYLE table handle code 35

DIMTAD DXF header variable 17

DIMTDEC DXF header variable 17

DIMTFAC DXF header variable 17

DIMTIHDXFheadervariable 17

DIMTIX DXF header variable 17

DIMTM DXF header variable 17

DIMTMOVE DXF header variable 17

DIMTOFL DXF header variable 17

DIMTOH DXF header variable 17

DIMTOLDXFheadervariable 17

DIMTOLJ DXF header variable 17

DIMTP DXF header variable 18

DIMTSZ DXF header variable 18

DIMTVP DXF header variable 18

DIMTXSTY DXF header variable 18

DIMTXT DXF header variable 18

DIMTZIN DXF header variable 18

DIMUPT DXF header variable 18

DIMZIN DXF header variable 18

DISPSILH DXF header variable 18

DRAGVSHeader variable 18

drawing interchange file formats

ASCII DXF 217

binary DXF 217, 234

Slide (SLD) 235

Slide Library (SLB) 239

DWFUNDERLAY 147

DWGCODEPAGE DXF header variable 18

DXF

conventions

group code ranges 3

group codes in numerical order 5

file parsers,subclass markers and 243

files. See ASCII DXF files\

format about

header variables 11

interface programs, writing (example) 227

record names, default class values 32

DXF files

DXF header variables in 11

group codes. See group codes (DXF files)

See also ASCII DXF files\

DXF format, objects vs. entities in 2

DXF header variables, in DXF files 11

DXFIN considerations for writing DXF files 234

# E

ECS. See object coordinate system

ELEVATION DXF header variable 18

elevation value for entity

positioning 250

ellipse edge data for hatch entities 93

ellipse group codes 86

endblk group codes 59

ENDCAPS DXF header variable 19

entities

block 57

coordinate systems associated with 251

endblk 57

entity group codes vs. object codes 2

group codes listed in numerical order 5

entities (DXF format)

end marker 2

group codes for 2,61

FIELD objects 168

hatch boundary path data 90

hatches 87

MATERIAL objects 179

TABLE objects 138

TABLESTYLE objects 205

viewports 150

vs. objects 2

ENTITIES section

about 61,218

and writing a DXF file 231

ENTITIES section (DXF files), about 2

extension dictionary 246

EXTMAX DXF header variable 19

EXTMIN DXF header variable 19

EXTNAMES DFX header variable 19

EXTRUDED SURFACE group codes 133

extrusion direction, OCS properties for 250

# F

FASTZ revised VPORT header variable 28

FIELD group codes 168

field value, data type 169

filing a stream of group data, subclass markers and 243

FILLETRAD DXF header variable 19

FILLMODE DXF header variable 19

FINGERPRINTGUID DXF header variable 19

fixed group codes 5

flags

Boolean flag group code range 4

UCS flags 153

viewport status flags 152

floating-point numbers, group code ranges 3

# G

GEODATA group codes 170

getvar AutoLISP function 219

gradients, shifted/unshifted definitions 90

graphical object group codes. See names of specific objects

GRIDMODE revised VPORT header variable 28

GRIDUNIT revised VPORT header variable 28

group codes (DXF files)

about 3,217

arbitrary handle range 242

ASCII DXF files and 219

binary DXF files and 234

for entities 2,61

FIELD objects 168

hatch boundary path data 90

hatches 87

MATERIAL objects 179

TABLE objects 138

TABLESTYLE objects 205

viewports 150

for entities (graphical objects) 61

examples of 219

fixed 5

formatting conventions for 2

HEADER section codes 11

in numerical order 5

objects/entities and 2

ranges of 3

reference handle ranges 241

values of

descriptions 5

type ranges 3

for xdata 249

group data, subclass markers and 243

GROUP group codes 172

# H

HALOGAP DXF header variable 19

handent functions (AutoLISP) 243

handles

about 241

arbitrary 242

of dictionary objects 246

reference 241

HANDSEED DXF header variable 19

hard references vs. soft references 242

hard-owner handles 8,242

hard-pointer handles 7-8,241

hatch entities

boundary path data group codes 90

group codes 87

hatch group codes 87

hatch pattern data 94

HEADER section

about 11,218

example of 219

group codes for revised VPORT

variables 28

group codes for saved DXF header

variables 11

time/date variables, handling of 29

and writing a DXF file 230

HEADER section (DXF files), group codes 11

HELIX group codes 94

HIDETEXT DXF header variable 19

HYPERLINKBASE DXF header

variable 19

# 1

IDBUFFER group codes 173

image group codes 95

IMAGEDEF group codes 173

IMAGEDEF_REACTOR group codes 174

INDEXCTL DXF header variable 20

inheritance levels for filer members, subclass markers and 243

INSBASE DXF header variable 20

INSERT command

ASCII control character handling and 219

binary DXF files and 235

insert group codes 97

INSUNITS DXF header variable 20

integers

32-bit integer values 9

group code ranges 3

INTERFERECOLORHeader variable 20

INTERFEREOBJVS Header variable 20

INTERFEREVPVS Header variable 20

INTERSECTIONDCFXheader variable 20

INTERSECTIONDXFheader variable 20

# J

JOINSTYLE DXF header variable 20

# K

key-field pair 169

# L

LAYER group codes 43

LAYER_FILTER group codes 175

LAYER_INDEX group codes 175

LAYOUT group codes 176

leader group codes 100

Light group codes 100

LIGHTLIST group codes 179

LIMCHECK DFX header variable 21

LIMMAX DXF header variable 21

LIMMIN DXF header variable 21

line edge data for hatch entities 92

line group codes 101

linear dimension group codes 81

lineweights,enumvalue 8

LOFTED SURFACE group codes 135

LTSCALE DXF header variable 21

LTYPE group codes 44

LUNITS DXF header variable 21

LUPREC DXF header variable 21

LWDISPLAY DXF header variable 21

lwpolyline group codes 102

# M

MATERIAL objects, group codes 179

MAXACTVP DXF header variable 21

MEASUREMENT DXF header variable 21

MENTALRAYRENDERSETTINGS 194

MENUDXFheadervariable 21

MIRTEXT DXF header variable 21

mleader group codes 107

mleaderstyle group codes 109

common 110

context data 112

leader line 117

leader node 116

mline group codes 104

MLINESTYLE group codes 186

Model_Space block definition 59

MSLIDE/VSLIDE commands 235

mtext group codes 117

multileader group codes 107

# N

named object dictionary 159

nongraphical object group codes. See names of specific objects

normal vector, arbitrary axis algorithm and 252

numerical order group codes 5

# 0

object coordinate system (OCS) 250-251 arbitrary axis algorithm and 252

OBJECT_PTR group codes 188

ObjectARX group code 1005 xdata items and 243

reference handles and 242

ObjectARX, reference handles and 242 objects

object group codes vs. entity codes 2

ownership of 159

objects (DXF format), vs. entities 2

OBJECTS section

about 159,218

common group codes 160

OBSCOLOR DXF header variable 21

OBSLTYPE DXF header variable 21

ole2frame entities, AutoLISP entnext function output (example) 123

ole2frame group codes 120

DXF output (example) 122

oleframe group codes 120

opacity maps, group codes 183

OPEN command

ASCII control character handling and 219

binary DXF files and 235

ordinate dimension group codes 85

ORTHOMODE DXF header variable 22

ownership pointers to extension dictionaries 241

ownership references vs. pointer references 242

# P

Paper_Space block definition 59

pattern data for hatch entities 94

PDMODE DXF header variable 22

PDSIZE DXF header variable 22

PELEVATION DXF header variable 22

persistent inter-object reference handles 241

persistent reactor tables 241, 246

PEXTMAX DXF header variable 22

PEXTMINDXFheadervariable 22

PFACE command considerations 125

PINSBASE DXF header variable 22

PLIMCHECK DXF header variable 22

PLIMMAX DXF header variable 22

PLIMMIN DXF header variable 22

PLINEGEN DXF header variable 22

PLINEWID DXF header variable 22

PLOT SETTINGS group codes 189

point group codes 123

pointer references vs. ownership references 242

polyface meshes in DXF 125

polyline boundary data for hatch entities 91

polyline group codes 123

polyface meshes and 125

PROJECTNAME DXF header variable 23

PROXYGRAPHICS DXF header variable 23

PSLTSCALE DXF header variable 23

PSSTYLEMODE DXF header variable 23

PSVPSCALE DXF header variable 23

PUCSBASE DXF header variable 23

PUCSNAME DXF header variable 23

PUCSORG DXF header variable 23

PUCSORGBACK DXF header variable 23

PUCSORGBOTTM DXF header variable 23

PUCSORGFRONT DXF header variable 23

PUCSORGLEFT DXF header variable 24

PUCSORGRIGHT DXF header variable 24

PUCSORGTOP DXF header variable 24

PUCSORTHOREF DXF header variable 24

PUCSORTHOVIEW DXF header variable 24

PUCSXDIR DXF header variable 24

PUCSYDIR DXF header variable 24

# Q

QTEXTMODE DXF header variable 24

# R

radial dimension group codes 82

ranges of group codes 3

RASTERVARIABLES group codes 192

ray group codes 126

reading a DXF file (example) 228

reference handles

hard vs. soft 242

pointer vs. ownership 242

types of 241

reflection maps, group codes 182

refraction maps, group codes 184

REGENMODE DXF header variable 24

region group codes 126

RENDERENVIRONMENT group codes 193

RENDERGLOBAL 197

REVOLVED SURFACE group codes 136

rotated dimension group codes 81

rows and columns (in tables), group codes 143

# s

SAVE command

Binary option 234

Select Objects option 218

SAVEAS command

ASCII control character handling and 219

binary DXF files and 235

Binary option 234

Select Objects option 218

SECTION group codes

Section Type Settings group codes $\mathbb{Q}$  200-201

SECTIONMANAGER group codes 199

sequend group codes 128

SHADEGE DXF header variable 24

SHADEDIF DXF header variable 24

SHADOWPLANELOCATION Header variable 24

shape group codes 128

SKETCHINC DXF header variable 24

SKPOLY DXF header variable 25

slide (SLD) files about 23

data record types 236

header format 235

hexdumpof的例子) 237

old-formatheader 238

vectors and 236

slide library (SLB) file format 239

SNAPANG revised VPORT header variable 28

SNAPBASE revised VPORT header variable 28

SNAPISOPAIR revised VPORT header variable 28

SNAPMODE revised VPORT header variable 28

SNAPSTYLE revised VPORT header variable 28

SNAPUNIT revised VPORT header variable 28

soft references vs. hard references 242

soft-owner handles 8,242

soft-pointer handles 241-242

solid group codes 89, 129

SORTENTS DXF header variable 25

SORTENTSTABLE group codes 204

SPATIAL_FILTER group codes 203

SPATIAL_INDEX group codes 202

specular color, group codes 181

specular maps, group codes 181

spline edge data for hatch entities 94
spline group codes 130

SPLINESEGS DXF header variable 25

SPLINETYPE DXF header variable 25

SSECTIONSETTINGS group codes 199

strings, group code ranges 3

STYLE group codes 46

subclass data marker 7

subclass markers 243

SUN group codes 103, 132

SURFACE group codes 133

SURFTAB1 DXF header variable 25

SURFTAB2 DXF header variable 25

SURSTYPE DXF header variable 25

SURFU DXF header variable 25

SURFVDXFheadervariable 25

SWEPT SURFACE group codes 137

symbol table entries

common group codes 37

structure of 35

symbol tables

common group codes 36

deleted items and 35

DIMSTYLE handle 35-36

handles and 241

identifying 35

structure of 35

system variables, saved in DXF files 11

# T

TABLE group codes 138

TABLES section

about 35,218

example of 220

symbol table common group codes 36

symbol table structure 35

and writing a DXF file 230

tables, group codes for 143

TABLESTYLE group codes 205

tagged data 1

TDCREATE DXF header variable 25

TDINDWG DXF header variable 25

TDUCREATE DXF header variable 25

TDUPDATE DXF header variable 25

TDUSRTIMER DXF header variable 26

TDUUPDATE DXF header variable 26

TEXT group codes 144

text strings, group code range 4

text style (in tables), group codes 206

TEXTSIZE DXF header variable 26

TEXTSTYLEDXFheader variable 26

THICKNESS DXF header variable 26

THUMBMAIL section

about 218

THUMBMAILIMAGE

group codes 215

THUMBMAILIMAGE section

about 215

TILEMODE DXF header variable 26

time/date variables, handling of 29

tolerance group codes 146

trace group codes 146

TRACEWID DXF header variable 26

TREEDEPTH DXF header variable 26

# U

UCS flags 153

UCS group codes 47

UCSBASE DFX header variable 26

UCSNAME DXF header variable 26

UCSORG DXF header variable 26

UCSORGBACKDXFheader variable 26

UCSORGBottom DXF header variable 26

UCSORGFRONT DXF header variable 26

UCSORGLEFT DXF header variable 26

UCSORGRIGHT DXF header variable 26

UCSORGTOPDXFheadervariable 27

UCSORTHOREF DXF header variable 27

UCSORTHOVIEW DXF header variable 27

UCSXDIR DXF header variable 27

UCSYDIR DXF header variable 27

Underlay Definition group codes 207

underlay group codes 147

UNITMODE DXF header variable 27

user coordinate system (UCS) 251

USER1-5 DXF header variable 27

USERR1-5 DXF header variable 27

USRTIMER DXF header variable 27

# V

VBA PROJECT group codes 211

vectors, in slide files 236

VERSIONGUID DXF header variable 27

vertex group codes 149

VIEW group codes 49

VIEWCTR revised VPORT header variable 28

VIEWDIR revised VPORT header variable 29

viewport entities coordinate systems associated with 251

group codes 150

status field 151

viewport group codes 150

VIEWSIZE revised VPORT header variable 29

VISRETAIN DXF header variable 27

Visual Basic programs (examples for reading a DXF file 228 for writing a DXF file 232

VISUALSTYLE group codes 208

VPORT group codes 52

VPORT header variables, revised 28

VSLIDE/MSLIDE commands 235

# W

wipeout group codes 155

WIPEOUTVARIABLES group codes 211

world coordinate system (WCS) 251

WORLDVIEW DXF header variable 27

writing a DXF file (example) 230

# X

$X$  and  $Y$  axes orientation calculations 251-252

$X$  axis, arbitrary axis algorithm and 252

XCLIPFRAME DXF header variable 27
xdata

and dimension entities 86

sample entity containing (DXF format) 246

xdata group codes 249

binary DXF group codes 234

XEDIT DXF header variable 28

xline group codes 157

XRECORD group codes 212

XY coordinates, working with 251

Y

$Y$  axis, arbitrary axis algorithm and 252

Z

Z axis

arbitrary axis algorithm and 252

OCS properties for 250
