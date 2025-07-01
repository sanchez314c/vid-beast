# VidBeast v3.5 Python Linting Fix List

Total remaining issues: 246

## Issues by Type (sorted by count):

90	E501   	line-too-long
21	S603   	subprocess-without-shell-equals-true
20	PLR2004	magic-value-comparison
14	PTH118 	os-path-join
13	PTH110 	os-path-exists
12	BLE001 	blind-except
 8	D101   	undocumented-public-class
 7	C901   	complex-structure
 6	SIM102 	collapsible-if
 6	PTH202 	os-path-getsize
 4	FBT002 	boolean-default-value-positional-argument
 4	FBT001 	boolean-type-hint-positional-argument
 3	PTH123 	builtin-open
 3	PTH122 	os-path-splitext
 3	PTH119 	os-path-basename
 3	PLR0912	too-many-branches
 2	TRY300 	try-consider-else
 2	S607   	start-process-with-partial-path
 2	PTH208 	os-listdir
 2	PTH113 	os-path-isfile
 2	PTH103 	os-makedirs
 2	PLR0915	too-many-statements
 2	PERF401	manual-list-comprehension
 2	D107   	undocumented-public-init
 1	TRY401 	verbose-log-message
 1	SIM103 	needless-bool
 1	S110   	try-except-pass
 1	PTH120 	os-path-dirname
 1	PTH112 	os-path-isdir
 1	G004   	logging-f-string
 1	EXE001 	shebang-not-executable
 1	ERA001 	commented-out-code
 1	D401   	non-imperative-mood
 1	D205   	missing-blank-line-after-summary
 1	D103   	undocumented-public-function
 1	B007   	unused-loop-control-variable
 1	ARG002 	unused-method-argument
warning: `multi-line-summary-first-line` (D212) and `multi-line-summary-second-line` (D213) are incompatible. Ignoring `multi-line-summary-second-line`.
warning: `incorrect-blank-line-before-class` (D203) and `no-blank-line-before-class` (D211) are incompatible. Ignoring `incorrect-blank-line-before-class`.
Found 246 errors.

## Detailed Issues:

sources/vidbeast.py:1:1: EXE001 Shebang is present but file is not executable
  |
1 | #!/usr/bin/env python3
  | ^^^^^^^^^^^^^^^^^^^^^^ EXE001
2 |
3 | ####################################################################################
  |

sources/vidbeast.py:16:1: ERA001 Found commented-out code
   |
14 | # Script Name: VidBeast v3.0 - Advanced Video Corruption Analysis & Repair Engine
15 | #
16 | # Author: Claude & Heathen-Admin
   | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ERA001
17 | # Date Created: 2025-01-29
18 | # Version: 3.0.0 - ADVANCED ENGINE
   |
   = help: Remove commented-out code

sources/vidbeast.py:28:1: D205 1 blank line required between summary line and description
   |
26 |   ####################################################################################
27 |
28 | / """VidBeast v3.0 - Advanced Video Corruption Analysis & Repair Engine.
29 | | ==================================================================
30 | |
31 | | Features:
32 | | - Deep bitstream corruption detection with H.264/H.265 NAL unit analysis
33 | | - Container structure analysis and repair (MP4, MOV, MKV, AVI)
34 | | - Stream integrity validation with packet-level inspection
35 | | - Frame-level corruption analysis with motion vector examination
36 | | - Advanced repair capabilities including:
37 | |   - Intelligent keyframe reconstruction
38 | |   - GOP structure rebuilding
39 | |   - Timestamp correction
40 | |   - Audio sync repair
41 | |   - Partial recovery with smart truncation
42 | |   - Multi-strategy repair attempts
43 | | - GPU-accelerated processing support
44 | | - Detailed forensic reporting
45 | | """
   | |___^ D205
46 |   from __future__ import annotations
   |
   = help: Insert single blank line

sources/vidbeast.py:66:89: E501 Line too long (119 > 88)
   |
64 | # Version and constants
65 | VERSION = "3.0.0"
66 | SUPPORTED_FORMATS = [".mp4", ".mov", ".avi", ".mkv", ".m4v", ".flv", ".webm", ".wmv", ".mpg", ".mpeg", ".mts", ".m2ts"]
   |                                                                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ E501
67 |
68 | # Setup logging
   |

sources/vidbeast.py:72:7: D101 Missing docstring in public class
   |
70 | logger = logging.getLogger(__name__)
71 |
72 | class CorruptionLevel(Enum):
   |       ^^^^^^^^^^^^^^^ D101
73 |     NONE = "none"
74 |     MINOR = "minor"
   |

sources/vidbeast.py:79:7: D101 Missing docstring in public class
   |
77 |     CATASTROPHIC = "catastrophic"
78 |
79 | class CorruptionType(Enum):
   |       ^^^^^^^^^^^^^^ D101
80 |     CONTAINER = "container"
81 |     STREAM = "stream"
   |

sources/vidbeast.py:89:7: D101 Missing docstring in public class
   |
87 |     GOP = "gop"
88 |
89 | class RepairStrategy(Enum):
   |       ^^^^^^^^^^^^^^ D101
90 |     EXTRACT_PLAYABLE = "extract_playable"
91 |     CONTAINER_REPAIR = "container_repair"
   |

sources/vidbeast.py:101:7: D101 Missing docstring in public class
    |
100 | @dataclass
101 | class StreamInfo:
    |       ^^^^^^^^^^ D101
102 |     index: int
103 |     codec_type: str
    |

sources/vidbeast.py:116:7: D101 Missing docstring in public class
    |
115 | @dataclass
116 | class CorruptionDetails:
    |       ^^^^^^^^^^^^^^^^^ D101
117 |     corruption_type: CorruptionType
118 |     severity: str
    |

sources/vidbeast.py:124:7: D101 Missing docstring in public class
    |
123 | @dataclass
124 | class RepairResult:
    |       ^^^^^^^^^^^^ D101
125 |     strategy: RepairStrategy
126 |     success: bool
    |

sources/vidbeast.py:133:7: D101 Missing docstring in public class
    |
132 | @dataclass
133 | class CorruptionReport:
    |       ^^^^^^^^^^^^^^^^ D101
134 |     file_path: str
135 |     file_size: int
    |

sources/vidbeast.py:151:9: D107 Missing docstring in `__init__`
    |
149 |     """Advanced video analysis engine with deep inspection capabilities."""
150 |
151 |     def __init__(self, ffmpeg_path: str, ffprobe_path: str) -> None:
    |         ^^^^^^^^ D107
152 |         self.ffmpeg_path = ffmpeg_path
153 |         self.ffprobe_path = ffprobe_path
    |

sources/vidbeast.py:176:18: S603 `subprocess` call: check for execution of untrusted input
    |
174 |             ]
175 |
176 |             with subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE) as process:
    |                  ^^^^^^^^^^^^^^^^ S603
177 |                 try:
178 |                     stdout, stderr = process.communicate(timeout=60)
    |

sources/vidbeast.py:176:89: E501 Line too long (98 > 88)
    |
174 |             ]
175 |
176 |             with subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE) as process:
    |                                                                                         ^^^^^^^^^^ E501
177 |                 try:
178 |                     stdout, stderr = process.communicate(timeout=60)
    |

sources/vidbeast.py:186:89: E501 Line too long (118 > 88)
    |
184 |                     for nal in nal_units:
185 |                         nal_type = nal["type"]
186 |                         analysis["nal_units"]["types"][nal_type] = analysis["nal_units"]["types"].get(nal_type, 0) + 1
    |                                                                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ E501
187 |
188 |                         if nal.get("corrupted"):
    |

sources/vidbeast.py:194:89: E501 Line too long (90 > 88)
    |
192 |                         if nal_type in [7, 8]:  # SPS or PPS
193 |                             analysis["sps_pps"]["found"] = True
194 |                             analysis["sps_pps"]["valid"] = not nal.get("corrupted", False)
    |                                                                                         ^^ E501
195 |
196 |                         # Count keyframes
    |

sources/vidbeast.py:197:40: PLR2004 Magic value used in comparison, consider replacing `5` with a constant variable
    |
196 |                         # Count keyframes
197 |                         if nal_type == 5:  # IDR slice
    |                                        ^ PLR2004
198 |                             analysis["keyframes"]["total"] += 1
199 |                             if nal.get("corrupted"):
    |

sources/vidbeast.py:203:89: E501 Line too long (101 > 88)
    |
202 |                     # Analyze keyframe intervals
203 |                     analysis["keyframes"]["interval"] = self._calculate_keyframe_intervals(nal_units)
    |                                                                                         ^^^^^^^^^^^^^ E501
204 |
205 |                 except subprocess.TimeoutExpired:
    |

sources/vidbeast.py:211:30: G004 Logging statement uses f-string
    |
210 |         except Exception as e:
211 |             logger.exception(f"H.264 bitstream analysis error: {e}")
    |                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ G004
212 |
213 |         return analysis
    |

sources/vidbeast.py:211:65: TRY401 Redundant exception object included in `logging.exception` call
    |
210 |         except Exception as e:
211 |             logger.exception(f"H.264 bitstream analysis error: {e}")
    |                                                                 ^ TRY401
212 |
213 |         return analysis
    |

sources/vidbeast.py:268:28: PLR2004 Magic value used in comparison, consider replacing `2` with a constant variable
    |
266 |     def _check_nal_corruption(self, nal_data: bytes) -> bool:
267 |         """Check if NAL unit appears corrupted."""
268 |         if len(nal_data) < 2:
    |                            ^ PLR2004
269 |             return True
    |

sources/vidbeast.py:276:9: SIM103 Return the condition directly
    |
275 |           # Check for reasonable NAL unit size
276 | /         if len(nal_data) > 1000000:  # > 1MB single NAL unit is suspicious
277 | |             return True
278 | |
279 | |         return False
    | |____________________^ SIM103
280 |
281 |       def _calculate_keyframe_intervals(self, nal_units: list[dict[str, Any]]) -> list[int]:
    |
    = help: Inline condition

sources/vidbeast.py:276:28: PLR2004 Magic value used in comparison, consider replacing `1000000` with a constant variable
    |
275 |         # Check for reasonable NAL unit size
276 |         if len(nal_data) > 1000000:  # > 1MB single NAL unit is suspicious
    |                            ^^^^^^^ PLR2004
277 |             return True
    |

sources/vidbeast.py:281:89: E501 Line too long (90 > 88)
    |
279 |         return False
280 |
281 |     def _calculate_keyframe_intervals(self, nal_units: list[dict[str, Any]]) -> list[int]:
    |                                                                                         ^^ E501
282 |         """Calculate intervals between keyframes."""
283 |         keyframe_positions = []
    |

sources/vidbeast.py:288:35: PLR2004 Magic value used in comparison, consider replacing `5` with a constant variable
    |
286 |         for nal in nal_units:
287 |             if nal["type"] in [1, 5]:  # Slice NAL units
288 |                 if nal["type"] == 5:  # IDR
    |                                   ^ PLR2004
289 |                     keyframe_positions.append(frame_count)
290 |                 frame_count += 1
    |

sources/vidbeast.py:294:13: PERF401 Use a list comprehension to create a transformed list
    |
292 |         intervals = []
293 |         for i in range(1, len(keyframe_positions)):
294 |             intervals.append(keyframe_positions[i] - keyframe_positions[i-1])
    |             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ PERF401
295 |
296 |         return intervals
    |
    = help: Replace for loop with list comprehension

sources/vidbeast.py:310:18: PTH123 `open()` should be replaced by `Path.open()`
    |
309 |         try:
310 |             with open(file_path, "rb") as f:
    |                  ^^^^ PTH123
311 |                 file_size = os.path.getsize(file_path)
312 |                 offset = 0
    |

sources/vidbeast.py:311:29: PTH202 `os.path.getsize` should be replaced by `Path.stat().st_size`
    |
309 |         try:
310 |             with open(file_path, "rb") as f:
311 |                 file_size = os.path.getsize(file_path)
    |                             ^^^^^^^^^^^^^^^ PTH202
312 |                 offset = 0
    |
    = help: Replace with `Path(...).stat().st_size`

sources/vidbeast.py:318:38: PLR2004 Magic value used in comparison, consider replacing `8` with a constant variable
    |
316 |                     f.seek(offset)
317 |                     header = f.read(8)
318 |                     if len(header) < 8:
    |                                      ^ PLR2004
319 |                         break
    |

sources/vidbeast.py:327:50: PLR2004 Magic value used in comparison, consider replacing `8` with a constant variable
    |
325 |                     if size == 1:
326 |                         extended_size = f.read(8)
327 |                         if len(extended_size) == 8:
    |                                                  ^ PLR2004
328 |                             size = struct.unpack(">Q", extended_size)[0]
    |

sources/vidbeast.py:339:89: E501 Line too long (90 > 88)
    |
337 |                     if size == 0 or size > file_size - offset:
338 |                         atom_info["error"] = "Invalid size"
339 |                         analysis["errors"].append(f"Invalid atom size at offset {offset}")
    |                                                                                         ^^ E501
340 |                         break
    |

sources/vidbeast.py:358:16: BLE001 Do not catch blind exception: `Exception`
    |
356 |                     offset += size
357 |
358 |         except Exception as e:
    |                ^^^^^^^^^ BLE001
359 |             analysis["errors"].append(f"Container analysis error: {e!s}")
    |

sources/vidbeast.py:363:7: D101 Missing docstring in public class
    |
361 |         return analysis
362 |
363 | class VidBeast:
    |       ^^^^^^^^ D101
364 |     def __init__(self, verbose: bool = False, repair_mode: bool = False,
365 |                  output_dir: str | None = None, max_threads: int = 4,
    |

sources/vidbeast.py:364:9: D107 Missing docstring in `__init__`
    |
363 | class VidBeast:
364 |     def __init__(self, verbose: bool = False, repair_mode: bool = False,
    |         ^^^^^^^^ D107
365 |                  output_dir: str | None = None, max_threads: int = 4,
366 |                  gpu_acceleration: bool = False) -> None:
    |

sources/vidbeast.py:364:24: FBT001 Boolean-typed positional argument in function definition
    |
363 | class VidBeast:
364 |     def __init__(self, verbose: bool = False, repair_mode: bool = False,
    |                        ^^^^^^^ FBT001
365 |                  output_dir: str | None = None, max_threads: int = 4,
366 |                  gpu_acceleration: bool = False) -> None:
    |

sources/vidbeast.py:364:24: FBT002 Boolean default positional argument in function definition
    |
363 | class VidBeast:
364 |     def __init__(self, verbose: bool = False, repair_mode: bool = False,
    |                        ^^^^^^^ FBT002
365 |                  output_dir: str | None = None, max_threads: int = 4,
366 |                  gpu_acceleration: bool = False) -> None:
    |

sources/vidbeast.py:364:47: FBT001 Boolean-typed positional argument in function definition
    |
363 | class VidBeast:
364 |     def __init__(self, verbose: bool = False, repair_mode: bool = False,
    |                                               ^^^^^^^^^^^ FBT001
365 |                  output_dir: str | None = None, max_threads: int = 4,
366 |                  gpu_acceleration: bool = False) -> None:
    |

sources/vidbeast.py:364:47: FBT002 Boolean default positional argument in function definition
    |
363 | class VidBeast:
364 |     def __init__(self, verbose: bool = False, repair_mode: bool = False,
    |                                               ^^^^^^^^^^^ FBT002
365 |                  output_dir: str | None = None, max_threads: int = 4,
366 |                  gpu_acceleration: bool = False) -> None:
    |

sources/vidbeast.py:366:18: FBT001 Boolean-typed positional argument in function definition
    |
364 |     def __init__(self, verbose: bool = False, repair_mode: bool = False,
365 |                  output_dir: str | None = None, max_threads: int = 4,
366 |                  gpu_acceleration: bool = False) -> None:
    |                  ^^^^^^^^^^^^^^^^ FBT001
367 |         self.verbose = verbose
368 |         self.repair_mode = repair_mode
    |

sources/vidbeast.py:366:18: FBT002 Boolean default positional argument in function definition
    |
364 |     def __init__(self, verbose: bool = False, repair_mode: bool = False,
365 |                  output_dir: str | None = None, max_threads: int = 4,
366 |                  gpu_acceleration: bool = False) -> None:
    |                  ^^^^^^^^^^^^^^^^ FBT002
367 |         self.verbose = verbose
368 |         self.repair_mode = repair_mode
    |

sources/vidbeast.py:388:89: E501 Line too long (116 > 88)
    |
386 |         self.log("VidBeast v{} initialized{}".format(
387 |             VERSION,
388 |             " (REPAIR MODE + GPU)" if repair_mode and gpu_acceleration else " (REPAIR MODE)" if repair_mode else "",
    |                                                                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ E501
389 |         ))
    |

sources/vidbeast.py:391:19: ARG002 Unused method argument: `message`
    |
389 |         ))
390 |
391 |     def log(self, message: str) -> None:
    |                   ^^^^^^^ ARG002
392 |         """Print log message if verbose mode enabled."""
393 |         if self.verbose:
    |

sources/vidbeast.py:399:37: S607 Starting a process with a partial executable path
    |
397 |         """Find FFprobe executable."""
398 |         try:
399 |             result = subprocess.run(["ffprobe", "-version"],
    |                                     ^^^^^^^^^^^^^^^^^^^^^^^ S607
400 |                                   check=False, capture_output=True, text=True)
401 |             if result.returncode == 0:
    |

sources/vidbeast.py:410:37: S607 Starting a process with a partial executable path
    |
408 |         """Find FFmpeg executable."""
409 |         try:
410 |             result = subprocess.run(["ffmpeg", "-version"],
    |                                     ^^^^^^^^^^^^^^^^^^^^^^ S607
411 |                                   check=False, capture_output=True, text=True, timeout=10)
412 |             if result.returncode == 0:
    |

sources/vidbeast.py:411:89: E501 Line too long (90 > 88)
    |
409 |         try:
410 |             result = subprocess.run(["ffmpeg", "-version"],
411 |                                   check=False, capture_output=True, text=True, timeout=10)
    |                                                                                         ^^ E501
412 |             if result.returncode == 0:
413 |                 return "ffmpeg"
    |

sources/vidbeast.py:419:89: E501 Line too long (89 > 88)
    |
418 |     def analyze_file(self, file_path: str) -> CorruptionReport:
419 |         """Comprehensive corruption analysis of a video file with advanced techniques."""
    |                                                                                         ^ E501
420 |         self.log(f"Analyzing: {os.path.basename(file_path)}")
    |

sources/vidbeast.py:420:32: PTH119 `os.path.basename()` should be replaced by `Path.name`
    |
418 |     def analyze_file(self, file_path: str) -> CorruptionReport:
419 |         """Comprehensive corruption analysis of a video file with advanced techniques."""
420 |         self.log(f"Analyzing: {os.path.basename(file_path)}")
    |                                ^^^^^^^^^^^^^^^^ PTH119
421 |
422 |         if not os.path.exists(file_path):
    |
    = help: Replace with `Path(...).name`

sources/vidbeast.py:422:16: PTH110 `os.path.exists()` should be replaced by `Path.exists()`
    |
420 |         self.log(f"Analyzing: {os.path.basename(file_path)}")
421 |
422 |         if not os.path.exists(file_path):
    |                ^^^^^^^^^^^^^^ PTH110
423 |             msg = f"File not found: {file_path}"
424 |             raise FileNotFoundError(msg)
    |
    = help: Replace with `Path(...).exists()`

sources/vidbeast.py:426:21: PTH202 `os.path.getsize` should be replaced by `Path.stat().st_size`
    |
424 |             raise FileNotFoundError(msg)
425 |
426 |         file_size = os.path.getsize(file_path)
    |                     ^^^^^^^^^^^^^^^ PTH202
427 |
428 |         # Initialize report
    |
    = help: Replace with `Path(...).stat().st_size`

sources/vidbeast.py:479:9: D401 First line of docstring should be in imperative mood: "Basic file size and format validation."
    |
478 |     def _analyze_file_basics(self, report: CorruptionReport) -> None:
479 |         """Basic file size and format validation."""
    |         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ D401
480 |         self.log("Phase 1: Basic file validation")
    |

sources/vidbeast.py:515:20: PTH122 `os.path.splitext()` should be replaced by `Path.suffix`, `Path.stem`, and `Path.parent`
    |
514 |         # Check file extension
515 |         file_ext = os.path.splitext(report.file_path)[1].lower()
    |                    ^^^^^^^^^^^^^^^^ PTH122
516 |         if file_ext not in SUPPORTED_FORMATS:
517 |             analysis["unsupported_format"] = True
    |

sources/vidbeast.py:522:18: PTH123 `open()` should be replaced by `Path.open()`
    |
520 |         # Check file header
521 |         try:
522 |             with open(report.file_path, "rb") as f:
    |                  ^^^^ PTH123
523 |                 header = f.read(12)
524 |                 analysis["header_bytes"] = header.hex()
    |

sources/vidbeast.py:547:16: BLE001 Do not catch blind exception: `Exception`
    |
545 |                             ),
546 |                         )
547 |         except Exception as e:
    |                ^^^^^^^^^ BLE001
548 |             analysis["header_read_error"] = str(e)
    |

sources/vidbeast.py:552:9: C901 `_analyze_container` is too complex (11 > 10)
    |
550 |         report.detailed_analysis["file_basics"] = analysis
551 |
552 |     def _analyze_container(self, report: CorruptionReport) -> None:
    |         ^^^^^^^^^^^^^^^^^^ C901
553 |         """Advanced container structure analysis."""
554 |         self.log("Phase 2: Container analysis")
    |

sources/vidbeast.py:569:22: S603 `subprocess` call: check for execution of untrusted input
    |
567 |             ]
568 |
569 |             result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=30)
    |                      ^^^^^^^^^^^^^^ S603
570 |
571 |             if result.returncode != 0:
    |

sources/vidbeast.py:569:89: E501 Line too long (97 > 88)
    |
567 |             ]
568 |
569 |             result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=30)
    |                                                                                         ^^^^^^^^^ E501
570 |
571 |             if result.returncode != 0:
    |

sources/vidbeast.py:605:89: E501 Line too long (104 > 88)
    |
604 |             # Deep container analysis for MP4/MOV
605 |             if container_analysis.get("format_name", "").lower() in ["mov", "mp4", "m4a", "3gp", "3g2"]:
    |                                                                                         ^^^^^^^^^^^^^^^^ E501
606 |                 atom_analysis = self.analyzer.analyze_container_atoms(report.file_path)
607 |                 report.detailed_analysis["atoms"] = atom_analysis
    |

sources/vidbeast.py:619:89: E501 Line too long (96 > 88)
    |
617 |                         ),
618 |                     )
619 |                     if report.corruption_level in [CorruptionLevel.NONE, CorruptionLevel.MINOR]:
    |                                                                                         ^^^^^^^^ E501
620 |                         report.corruption_level = CorruptionLevel.SEVERE
    |

sources/vidbeast.py:630:16: BLE001 Do not catch blind exception: `Exception`
    |
628 |             report.corruption_level = CorruptionLevel.MODERATE
629 |             report.detailed_analysis["container"] = {"json_decode_error": True}
630 |         except Exception as e:
    |                ^^^^^^^^^ BLE001
631 |             report.corruption_types.append(CorruptionType.CONTAINER)
632 |             report.detailed_analysis["container"] = {"unexpected_error": str(e)}
    |

sources/vidbeast.py:669:89: E501 Line too long (90 > 88)
    |
667 |                 stream_info.width = stream.get("width")
668 |                 stream_info.height = stream.get("height")
669 |                 stream_info.fps = self._parse_framerate(stream.get("r_frame_rate", "0/0"))
    |                                                                                         ^^ E501
670 |                 stream_info.bitrate = int(stream.get("bit_rate", 0)) if stream.get("bit_rate") else None
671 |                 stream_info.duration = float(stream.get("duration", 0)) if stream.get("duration") else None
    |

sources/vidbeast.py:670:89: E501 Line too long (104 > 88)
    |
668 |                 stream_info.height = stream.get("height")
669 |                 stream_info.fps = self._parse_framerate(stream.get("r_frame_rate", "0/0"))
670 |                 stream_info.bitrate = int(stream.get("bit_rate", 0)) if stream.get("bit_rate") else None
    |                                                                                         ^^^^^^^^^^^^^^^^ E501
671 |                 stream_info.duration = float(stream.get("duration", 0)) if stream.get("duration") else None
672 |                 stream_info.nb_frames = int(stream.get("nb_frames", 0)) if stream.get("nb_frames") else None
    |

sources/vidbeast.py:671:89: E501 Line too long (107 > 88)
    |
669 |                 stream_info.fps = self._parse_framerate(stream.get("r_frame_rate", "0/0"))
670 |                 stream_info.bitrate = int(stream.get("bit_rate", 0)) if stream.get("bit_rate") else None
671 |                 stream_info.duration = float(stream.get("duration", 0)) if stream.get("duration") else None
    |                                                                                         ^^^^^^^^^^^^^^^^^^^ E501
672 |                 stream_info.nb_frames = int(stream.get("nb_frames", 0)) if stream.get("nb_frames") else None
673 |                 video_streams.append(stream_info)
    |

sources/vidbeast.py:672:89: E501 Line too long (108 > 88)
    |
670 |                 stream_info.bitrate = int(stream.get("bit_rate", 0)) if stream.get("bit_rate") else None
671 |                 stream_info.duration = float(stream.get("duration", 0)) if stream.get("duration") else None
672 |                 stream_info.nb_frames = int(stream.get("nb_frames", 0)) if stream.get("nb_frames") else None
    |                                                                                         ^^^^^^^^^^^^^^^^^^^^ E501
673 |                 video_streams.append(stream_info)
    |

sources/vidbeast.py:677:89: E501 Line too long (114 > 88)
    |
675 |             elif stream.get("codec_type") == "audio":
676 |                 stream_info.channels = stream.get("channels")
677 |                 stream_info.sample_rate = int(stream.get("sample_rate", 0)) if stream.get("sample_rate") else None
    |                                                                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^ E501
678 |                 stream_info.bitrate = int(stream.get("bit_rate", 0)) if stream.get("bit_rate") else None
679 |                 audio_streams.append(stream_info)
    |

sources/vidbeast.py:678:89: E501 Line too long (104 > 88)
    |
676 |                 stream_info.channels = stream.get("channels")
677 |                 stream_info.sample_rate = int(stream.get("sample_rate", 0)) if stream.get("sample_rate") else None
678 |                 stream_info.bitrate = int(stream.get("bit_rate", 0)) if stream.get("bit_rate") else None
    |                                                                                         ^^^^^^^^^^^^^^^^ E501
679 |                 audio_streams.append(stream_info)
    |

sources/vidbeast.py:709:30: PLR2004 Magic value used in comparison, consider replacing `2` with a constant variable
    |
707 |         try:
708 |             parts = fps_string.split("/")
709 |             if len(parts) == 2 and int(parts[1]) != 0:
    |                              ^ PLR2004
710 |                 return float(parts[0]) / float(parts[1])
711 |         except (ValueError, ZeroDivisionError):
    |

sources/vidbeast.py:728:89: E501 Line too long (92 > 88)
    |
727 |         # Check for suspicious properties
728 |         if not stream.width or not stream.height or stream.width == 0 or stream.height == 0:
    |                                                                                         ^^^^ E501
729 |             analysis["invalid_dimensions"] = True
730 |             stream.errors.append("Invalid video dimensions")
    |

sources/vidbeast.py:732:9: SIM102 Use a single `if` statement instead of nested `if` statements
    |
730 |               stream.errors.append("Invalid video dimensions")
731 |
732 | /         if stream.bitrate:
733 | |             if stream.bitrate < 50000:  # Less than 50kbps is suspicious
    | |______________________________________^ SIM102
734 |                   analysis["suspicious_bitrate"] = True
735 |                   stream.errors.append("Suspiciously low bitrate")
    |
    = help: Combine `if` statements using `and`

sources/vidbeast.py:733:33: PLR2004 Magic value used in comparison, consider replacing `50000` with a constant variable
    |
732 |         if stream.bitrate:
733 |             if stream.bitrate < 50000:  # Less than 50kbps is suspicious
    |                                 ^^^^^ PLR2004
734 |                 analysis["suspicious_bitrate"] = True
735 |                 stream.errors.append("Suspiciously low bitrate")
    |

sources/vidbeast.py:738:9: SIM102 Use a single `if` statement instead of nested `if` statements
    |
737 |           # Check for reasonable resolution
738 | /         if stream.width and stream.height:
739 | |             if stream.width > 8192 or stream.height > 8192:
    | |___________________________________________________________^ SIM102
740 |                   analysis["excessive_resolution"] = True
741 |                   stream.errors.append("Excessive resolution")
    |
    = help: Combine `if` statements using `and`

sources/vidbeast.py:739:31: PLR2004 Magic value used in comparison, consider replacing `8192` with a constant variable
    |
737 |         # Check for reasonable resolution
738 |         if stream.width and stream.height:
739 |             if stream.width > 8192 or stream.height > 8192:
    |                               ^^^^ PLR2004
740 |                 analysis["excessive_resolution"] = True
741 |                 stream.errors.append("Excessive resolution")
    |

sources/vidbeast.py:739:55: PLR2004 Magic value used in comparison, consider replacing `8192` with a constant variable
    |
737 |         # Check for reasonable resolution
738 |         if stream.width and stream.height:
739 |             if stream.width > 8192 or stream.height > 8192:
    |                                                       ^^^^ PLR2004
740 |                 analysis["excessive_resolution"] = True
741 |                 stream.errors.append("Excessive resolution")
    |

sources/vidbeast.py:831:9: SIM102 Use a single `if` statement instead of nested `if` statements
    |
830 |           # Update corruption level based on stream errors
831 | /         if any(stream.errors for stream in report.streams):
832 | |             if report.corruption_level == CorruptionLevel.NONE:
    | |_______________________________________________________________^ SIM102
833 |                   report.corruption_level = CorruptionLevel.MODERATE
    |
    = help: Combine `if` statements using `and`

sources/vidbeast.py:835:9: C901 `_analyze_bitstream` is too complex (11 > 10)
    |
833 |                 report.corruption_level = CorruptionLevel.MODERATE
834 |
835 |     def _analyze_bitstream(self, report: CorruptionReport) -> None:
    |         ^^^^^^^^^^^^^^^^^^ C901
836 |         """Advanced bitstream-level corruption analysis."""
837 |         self.log("Phase 4: Bitstream analysis")
    |

sources/vidbeast.py:854:22: S603 `subprocess` call: check for execution of untrusted input
    |
852 |             ]
853 |
854 |             result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=120)
    |                      ^^^^^^^^^^^^^^ S603
855 |
856 |             bitstream_analysis = {
    |

sources/vidbeast.py:854:89: E501 Line too long (98 > 88)
    |
852 |             ]
853 |
854 |             result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=120)
    |                                                                                         ^^^^^^^^^^ E501
855 |
856 |             bitstream_analysis = {
    |

sources/vidbeast.py:876:70: PLR2004 Magic value used in comparison, consider replacing `10` with a constant variable
    |
874 |                 total_errors = sum(error_counts.values())
875 |
876 |                 if error_patterns.get("reference_frame_errors", 0) > 10:
    |                                                                      ^^ PLR2004
877 |                     report.corruption_types.append(CorruptionType.BITSTREAM)
878 |                     report.corruption_details.append(
    |

sources/vidbeast.py:887:60: PLR2004 Magic value used in comparison, consider replacing `5` with a constant variable
    |
885 |                     )
886 |
887 |                 if error_patterns.get("slice_errors", 0) > 5:
    |                                                            ^ PLR2004
888 |                     report.corruption_types.append(CorruptionType.BITSTREAM)
889 |                     report.corruption_details.append(
    |

sources/vidbeast.py:898:35: PLR2004 Magic value used in comparison, consider replacing `100` with a constant variable
    |
896 |                     )
897 |
898 |                 if total_errors > 100:
    |                                   ^^^ PLR2004
899 |                     if report.corruption_level in [CorruptionLevel.NONE, CorruptionLevel.MINOR]:
900 |                         report.corruption_level = CorruptionLevel.MODERATE
    |

sources/vidbeast.py:899:89: E501 Line too long (96 > 88)
    |
898 |                 if total_errors > 100:
899 |                     if report.corruption_level in [CorruptionLevel.NONE, CorruptionLevel.MINOR]:
    |                                                                                         ^^^^^^^^ E501
900 |                         report.corruption_level = CorruptionLevel.MODERATE
901 |                 elif total_errors > 10:
    |

sources/vidbeast.py:901:17: SIM102 Use a single `if` statement instead of nested `if` statements
    |
899 |                       if report.corruption_level in [CorruptionLevel.NONE, CorruptionLevel.MINOR]:
900 |                           report.corruption_level = CorruptionLevel.MODERATE
901 | /                 elif total_errors > 10:
902 | |                     if report.corruption_level == CorruptionLevel.NONE:
    | |_______________________________________________________________________^ SIM102
903 |                           report.corruption_level = CorruptionLevel.MINOR
    |
    = help: Combine `if` statements using `and`

sources/vidbeast.py:901:37: PLR2004 Magic value used in comparison, consider replacing `10` with a constant variable
    |
899 |                     if report.corruption_level in [CorruptionLevel.NONE, CorruptionLevel.MINOR]:
900 |                         report.corruption_level = CorruptionLevel.MODERATE
901 |                 elif total_errors > 10:
    |                                     ^^ PLR2004
902 |                     if report.corruption_level == CorruptionLevel.NONE:
903 |                         report.corruption_level = CorruptionLevel.MINOR
    |

sources/vidbeast.py:909:16: BLE001 Do not catch blind exception: `Exception`
    |
907 |         except subprocess.TimeoutExpired:
908 |             report.detailed_analysis["bitstream"] = {"decode_timeout": True}
909 |         except Exception as e:
    |                ^^^^^^^^^ BLE001
910 |             report.detailed_analysis["bitstream"] = {"analysis_error": str(e)}
    |

sources/vidbeast.py:961:89: E501 Line too long (107 > 88)
    |
959 |         """Analyze error patterns for specific issues."""
960 |         return {
961 |             "reference_frame_errors": len(re.findall(r"reference picture missing", errors, re.IGNORECASE)),
    |                                                                                         ^^^^^^^^^^^^^^^^^^^ E501
962 |             "slice_errors": len(re.findall(r"error while parsing slice", errors, re.IGNORECASE)),
963 |             "timestamp_discontinuities": len(re.findall(r"non-monotonous (DTS|PTS)", errors, re.IGNORECASE)),
    |

sources/vidbeast.py:962:89: E501 Line too long (97 > 88)
    |
960 |         return {
961 |             "reference_frame_errors": len(re.findall(r"reference picture missing", errors, re.IGNORECASE)),
962 |             "slice_errors": len(re.findall(r"error while parsing slice", errors, re.IGNORECASE)),
    |                                                                                         ^^^^^^^^^ E501
963 |             "timestamp_discontinuities": len(re.findall(r"non-monotonous (DTS|PTS)", errors, re.IGNORECASE)),
964 |             "keyframe_errors": len(re.findall(r"(IDR|keyframe)", errors, re.IGNORECASE)),
    |

sources/vidbeast.py:963:89: E501 Line too long (109 > 88)
    |
961 |             "reference_frame_errors": len(re.findall(r"reference picture missing", errors, re.IGNORECASE)),
962 |             "slice_errors": len(re.findall(r"error while parsing slice", errors, re.IGNORECASE)),
963 |             "timestamp_discontinuities": len(re.findall(r"non-monotonous (DTS|PTS)", errors, re.IGNORECASE)),
    |                                                                                         ^^^^^^^^^^^^^^^^^^^^^ E501
964 |             "keyframe_errors": len(re.findall(r"(IDR|keyframe)", errors, re.IGNORECASE)),
965 |         }
    |

sources/vidbeast.py:964:89: E501 Line too long (89 > 88)
    |
962 |             "slice_errors": len(re.findall(r"error while parsing slice", errors, re.IGNORECASE)),
963 |             "timestamp_discontinuities": len(re.findall(r"non-monotonous (DTS|PTS)", errors, re.IGNORECASE)),
964 |             "keyframe_errors": len(re.findall(r"(IDR|keyframe)", errors, re.IGNORECASE)),
    |                                                                                         ^ E501
965 |         }
    |

sources/vidbeast.py:972:89: E501 Line too long (89 > 88)
    |
971 |         # Find video stream
972 |         video_stream = next((s for s in report.streams if s.codec_type == "video"), None)
    |                                                                                         ^ E501
973 |
974 |         if not video_stream:
    |

sources/vidbeast.py:999:82: PLR2004 Magic value used in comparison, consider replacing `5` with a constant variable
     |
 997 |             if h264_analysis["keyframes"]["corrupted"] > 0:
 998 |                 report.corruption_types.append(CorruptionType.KEYFRAME)
 999 |                 severity = "severe" if h264_analysis["keyframes"]["corrupted"] > 5 else "moderate"
     |                                                                                  ^ PLR2004
1000 |                 report.corruption_details.append(
1001 |                     CorruptionDetails(
     |

sources/vidbeast.py:999:89: E501 Line too long (98 > 88)
     |
 997 |             if h264_analysis["keyframes"]["corrupted"] > 0:
 998 |                 report.corruption_types.append(CorruptionType.KEYFRAME)
 999 |                 severity = "severe" if h264_analysis["keyframes"]["corrupted"] > 5 else "moderate"
     |                                                                                         ^^^^^^^^^^ E501
1000 |                 report.corruption_details.append(
1001 |                     CorruptionDetails(
     |

sources/vidbeast.py:1004:89: E501 Line too long (101 > 88)
     |
1002 |                         corruption_type=CorruptionType.KEYFRAME,
1003 |                         severity=severity,
1004 |                         description=f"{h264_analysis['keyframes']['corrupted']} corrupted keyframes",
     |                                                                                         ^^^^^^^^^^^^^ E501
1005 |                         fixable=True,
1006 |                     ),
     |

sources/vidbeast.py:1031:22: S603 `subprocess` call: check for execution of untrusted input
     |
1029 |             ]
1030 |
1031 |             result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=30)
     |                      ^^^^^^^^^^^^^^ S603
1032 |
1033 |             if result.returncode == 0:
     |

sources/vidbeast.py:1031:89: E501 Line too long (97 > 88)
     |
1029 |             ]
1030 |
1031 |             result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=30)
     |                                                                                         ^^^^^^^^^ E501
1032 |
1033 |             if result.returncode == 0:
     |

sources/vidbeast.py:1061:89: E501 Line too long (106 > 88)
     |
1059 |                         # Check for backwards timestamps
1060 |                         if pts_val < prev_pts_val:
1061 |                             timestamp_analysis["pts_errors"] = timestamp_analysis.get("pts_errors", 0) + 1
     |                                                                                         ^^^^^^^^^^^^^^^^^^ E501
1062 |
1063 |                     if dts and prev_dts:
     |

sources/vidbeast.py:1063:21: SIM102 Use a single `if` statement instead of nested `if` statements
     |
1061 |                               timestamp_analysis["pts_errors"] = timestamp_analysis.get("pts_errors", 0) + 1
1062 |
1063 | /                     if dts and prev_dts:
1064 | |                         if float(dts) < float(prev_dts):
     | |________________________________________________________^ SIM102
1065 |                               timestamp_analysis["dts_errors"] += 1
     |
     = help: Combine `if` statements using `and`

sources/vidbeast.py:1071:53: PLR2004 Magic value used in comparison, consider replacing `5` with a constant variable
     |
1070 |                 # Determine if there are sync issues
1071 |                 if timestamp_analysis["pts_gaps"] > 5 or timestamp_analysis["dts_errors"] > 0:
     |                                                     ^ PLR2004
1072 |                     timestamp_analysis["sync_issues"] = True
1073 |                     report.corruption_types.append(CorruptionType.TIMESTAMP)
     |

sources/vidbeast.py:1071:89: E501 Line too long (94 > 88)
     |
1070 |                 # Determine if there are sync issues
1071 |                 if timestamp_analysis["pts_gaps"] > 5 or timestamp_analysis["dts_errors"] > 0:
     |                                                                                         ^^^^^^ E501
1072 |                     timestamp_analysis["sync_issues"] = True
1073 |                     report.corruption_types.append(CorruptionType.TIMESTAMP)
     |

sources/vidbeast.py:1085:16: BLE001 Do not catch blind exception: `Exception`
     |
1083 |                 report.detailed_analysis["timestamps"] = timestamp_analysis
1084 |
1085 |         except Exception as e:
     |                ^^^^^^^^^ BLE001
1086 |             report.detailed_analysis["timestamps"] = {"error": str(e)}
     |

sources/vidbeast.py:1106:22: S603 `subprocess` call: check for execution of untrusted input
     |
1105 |             start_time = time.time()
1106 |             result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=300)
     |                      ^^^^^^^^^^^^^^ S603
1107 |             elapsed_time = time.time() - start_time
     |

sources/vidbeast.py:1106:89: E501 Line too long (98 > 88)
     |
1105 |             start_time = time.time()
1106 |             result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=300)
     |                                                                                         ^^^^^^^^^^ E501
1107 |             elapsed_time = time.time() - start_time
     |

sources/vidbeast.py:1123:89: E501 Line too long (95 > 88)
     |
1121 |             else:
1122 |                 # Try to determine playable duration
1123 |                 duration_match = re.search(r"time=(\d{2}):(\d{2}):(\d{2}\.\d+)", result.stderr)
     |                                                                                         ^^^^^^^ E501
1124 |                 if duration_match:
1125 |                     hours, minutes, seconds = duration_match.groups()
     |

sources/vidbeast.py:1126:89: E501 Line too long (101 > 88)
     |
1124 |                 if duration_match:
1125 |                     hours, minutes, seconds = duration_match.groups()
1126 |                     report.playable_duration = int(hours) * 3600 + int(minutes) * 60 + float(seconds)
     |                                                                                         ^^^^^^^^^^^^^ E501
1127 |                     report.is_playable = report.playable_duration > 0
     |

sources/vidbeast.py:1144:16: BLE001 Do not catch blind exception: `Exception`
     |
1142 |         except subprocess.TimeoutExpired:
1143 |             report.detailed_analysis["playability"] = {"decode_timeout": True}
1144 |         except Exception as e:
     |                ^^^^^^^^^ BLE001
1145 |             report.detailed_analysis["playability"] = {"test_error": str(e)}
     |

sources/vidbeast.py:1160:22: S603 `subprocess` call: check for execution of untrusted input
     |
1158 |             cmd = [self.ffprobe_path, "-v", "error", "-show_entries",
1159 |                    "format=duration", "-of", "json", file_path]
1160 |             result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=30)
     |                      ^^^^^^^^^^^^^^ S603
1161 |             if result.returncode == 0:
1162 |                 data = json.loads(result.stdout)
     |

sources/vidbeast.py:1160:89: E501 Line too long (97 > 88)
     |
1158 |             cmd = [self.ffprobe_path, "-v", "error", "-show_entries",
1159 |                    "format=duration", "-of", "json", file_path]
1160 |             result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=30)
     |                                                                                         ^^^^^^^^^ E501
1161 |             if result.returncode == 0:
1162 |                 data = json.loads(result.stdout)
     |

sources/vidbeast.py:1180:30: S603 `subprocess` call: check for execution of untrusted input
     |
1178 |                     ]
1179 |
1180 |                     result = subprocess.run(cmd, check=False, capture_output=True, timeout=5)
     |                              ^^^^^^^^^^^^^^ S603
1181 |
1182 |                     if result.returncode == 0:
     |

sources/vidbeast.py:1180:89: E501 Line too long (93 > 88)
     |
1178 |                     ]
1179 |
1180 |                     result = subprocess.run(cmd, check=False, capture_output=True, timeout=5)
     |                                                                                         ^^^^^ E501
1181 |
1182 |                     if result.returncode == 0:
     |

sources/vidbeast.py:1190:9: S110 `try`-`except`-`pass` detected, consider logging the exception
     |
1188 |                           break
1189 |
1190 | /         except Exception:
1191 | |             pass
     | |________________^ S110
1192 |
1193 |           return segment_info
     |

sources/vidbeast.py:1190:16: BLE001 Do not catch blind exception: `Exception`
     |
1188 |                         break
1189 |
1190 |         except Exception:
     |                ^^^^^^^^^ BLE001
1191 |             pass
     |

sources/vidbeast.py:1195:9: C901 `_generate_repair_recommendations` is too complex (18 > 10)
     |
1193 |         return segment_info
1194 |
1195 |     def _generate_repair_recommendations(self, report: CorruptionReport) -> None:
     |         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ C901
1196 |         """Generate intelligent repair recommendations based on analysis."""
1197 |         self.log("Phase 8: Generating repair recommendations")
     |

sources/vidbeast.py:1195:9: PLR0912 Too many branches (19 > 12)
     |
1193 |         return segment_info
1194 |
1195 |     def _generate_repair_recommendations(self, report: CorruptionReport) -> None:
     |         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ PLR0912
1196 |         """Generate intelligent repair recommendations based on analysis."""
1197 |         self.log("Phase 8: Generating repair recommendations")
     |

sources/vidbeast.py:1195:9: PLR0915 Too many statements (54 > 50)
     |
1193 |         return segment_info
1194 |
1195 |     def _generate_repair_recommendations(self, report: CorruptionReport) -> None:
     |         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ PLR0915
1196 |         """Generate intelligent repair recommendations based on analysis."""
1197 |         self.log("Phase 8: Generating repair recommendations")
     |

sources/vidbeast.py:1209:89: E501 Line too long (103 > 88)
     |
1208 |         if report.file_size < 100 * 1024:
1209 |             recommendations.append("File too small to contain valid video data - likely unrecoverable")
     |                                                                                         ^^^^^^^^^^^^^^^ E501
1210 |             report.repair_feasible = False
1211 |             report.repair_recommendations = recommendations
     |

sources/vidbeast.py:1221:89: E501 Line too long (112 > 88)
     |
1219 |             for detail in container_details:
1220 |                 if "moov atom" in detail.description.lower():
1221 |                     recommendations.append("Priority: Rebuild MP4/MOV moov atom using untrunc or similar tools")
     |                                                                                         ^^^^^^^^^^^^^^^^^^^^^^^^ E501
1222 |                     recommendations.append("Alternative: Extract raw streams and remux into new container")
1223 |                 elif "header" in detail.description.lower():
     |

sources/vidbeast.py:1222:89: E501 Line too long (107 > 88)
     |
1220 |                 if "moov atom" in detail.description.lower():
1221 |                     recommendations.append("Priority: Rebuild MP4/MOV moov atom using untrunc or similar tools")
1222 |                     recommendations.append("Alternative: Extract raw streams and remux into new container")
     |                                                                                         ^^^^^^^^^^^^^^^^^^^ E501
1223 |                 elif "header" in detail.description.lower():
1224 |                     recommendations.append("Repair container header structure")
     |

sources/vidbeast.py:1239:89: E501 Line too long (89 > 88)
     |
1237 |             for detail in bitstream_details:
1238 |                 if "reference frame" in detail.description.lower():
1239 |                     recommendations.append("Rebuild GOP structure with forced keyframes")
     |                                                                                         ^ E501
1240 |                     recommendations.append("Extract segments between valid keyframes")
1241 |                 elif "slice" in detail.description.lower():
     |

sources/vidbeast.py:1263:89: E501 Line too long (100 > 88)
     |
1261 |         # Playability-based recommendations
1262 |         if report.is_playable and report.playable_duration > 0:
1263 |             if report.total_duration > 0 and report.playable_duration < report.total_duration * 0.9:
     |                                                                                         ^^^^^^^^^^^^ E501
1264 |                 recommendations.append(f"Extract playable portion (first {report.playable_duration:.1f} seconds)")
1265 |                 recommendations.append("Use segment-based recovery for maximum extraction")
     |

sources/vidbeast.py:1264:89: E501 Line too long (114 > 88)
     |
1262 |         if report.is_playable and report.playable_duration > 0:
1263 |             if report.total_duration > 0 and report.playable_duration < report.total_duration * 0.9:
1264 |                 recommendations.append(f"Extract playable portion (first {report.playable_duration:.1f} seconds)")
     |                                                                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^ E501
1265 |                 recommendations.append("Use segment-based recovery for maximum extraction")
1266 |             else:
     |

sources/vidbeast.py:1265:89: E501 Line too long (91 > 88)
     |
1263 |             if report.total_duration > 0 and report.playable_duration < report.total_duration * 0.9:
1264 |                 recommendations.append(f"Extract playable portion (first {report.playable_duration:.1f} seconds)")
1265 |                 recommendations.append("Use segment-based recovery for maximum extraction")
     |                                                                                         ^^^ E501
1266 |             else:
1267 |                 recommendations.append("File mostly intact - simple remux may suffice")
     |

sources/vidbeast.py:1270:89: E501 Line too long (89 > 88)
     |
1268 |             report.repair_feasible = True
1269 |         else:
1270 |             recommendations.append("Deep repair required - full re-encoding recommended")
     |                                                                                         ^ E501
1271 |             recommendations.append("Try multiple repair strategies in sequence")
1272 |             report.repair_feasible = True  # Still try repairs
     |

sources/vidbeast.py:1281:9: C901 `_execute_repairs` is too complex (12 > 10)
     |
1279 |         report.repair_recommendations = recommendations
1280 |
1281 |     def _execute_repairs(self, report: CorruptionReport) -> None:
     |         ^^^^^^^^^^^^^^^^ C901
1282 |         """Execute multiple repair strategies with advanced techniques."""
1283 |         self.log("Phase 9: Executing repairs")
     |

sources/vidbeast.py:1286:31: PTH120 `os.path.dirname()` should be replaced by `Path.parent`
     |
1285 |         if not self.output_dir:
1286 |             self.output_dir = os.path.dirname(report.file_path)
     |                               ^^^^^^^^^^^^^^^ PTH120
1287 |
1288 |         os.makedirs(self.output_dir, exist_ok=True)
     |
     = help: Replace with `Path(...).parent`

sources/vidbeast.py:1288:9: PTH103 `os.makedirs()` should be replaced by `Path.mkdir(parents=True)`
     |
1286 |             self.output_dir = os.path.dirname(report.file_path)
1287 |
1288 |         os.makedirs(self.output_dir, exist_ok=True)
     |         ^^^^^^^^^^^ PTH103
1289 |
1290 |         base_name = os.path.splitext(os.path.basename(report.file_path))[0]
     |

sources/vidbeast.py:1290:21: PTH122 `os.path.splitext()` should be replaced by `Path.suffix`, `Path.stem`, and `Path.parent`
     |
1288 |         os.makedirs(self.output_dir, exist_ok=True)
1289 |
1290 |         base_name = os.path.splitext(os.path.basename(report.file_path))[0]
     |                     ^^^^^^^^^^^^^^^^ PTH122
1291 |
1292 |         # Try multiple repair strategies based on corruption type
     |

sources/vidbeast.py:1290:38: PTH119 `os.path.basename()` should be replaced by `Path.name`
     |
1288 |         os.makedirs(self.output_dir, exist_ok=True)
1289 |
1290 |         base_name = os.path.splitext(os.path.basename(report.file_path))[0]
     |                                      ^^^^^^^^^^^^^^^^ PTH119
1291 |
1292 |         # Try multiple repair strategies based on corruption type
     |
     = help: Replace with `Path(...).name`

sources/vidbeast.py:1319:20: BLE001 Do not catch blind exception: `Exception`
     |
1317 |                     report.repair_results.append(result)
1318 |
1319 |             except Exception as e:
     |                    ^^^^^^^^^ BLE001
1320 |                 self.log(f"Repair strategy {strategy.value} failed: {e}")
1321 |                 report.repair_results.append(
     |

sources/vidbeast.py:1329:89: E501 Line too long (90 > 88)
     |
1327 |                 )
1328 |
1329 |     def _select_repair_strategies(self, report: CorruptionReport) -> list[RepairStrategy]:
     |                                                                                         ^^ E501
1330 |         """Intelligently select repair strategies based on corruption analysis."""
1331 |         strategies = []
     |

sources/vidbeast.py:1355:89: E501 Line too long (117 > 88)
     |
1354 |         # Try segment recovery as last resort
1355 |         if len(strategies) == 0 or report.corruption_level in [CorruptionLevel.SEVERE, CorruptionLevel.CATASTROPHIC]:
     |                                                                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ E501
1356 |             strategies.append(RepairStrategy.SEGMENT_RECOVERY)
     |

sources/vidbeast.py:1360:89: E501 Line too long (99 > 88)
     |
1358 |         return strategies
1359 |
1360 |     def _extract_playable_advanced(self, report: CorruptionReport, base_name: str) -> RepairResult:
     |                                                                                         ^^^^^^^^^^^ E501
1361 |         """Advanced extraction of playable video portion."""
1362 |         output_path = os.path.join(self.output_dir, f"{base_name}_extracted.mp4")
     |

sources/vidbeast.py:1362:23: PTH118 `os.path.join()` should be replaced by `Path` with `/` operator
     |
1360 |     def _extract_playable_advanced(self, report: CorruptionReport, base_name: str) -> RepairResult:
1361 |         """Advanced extraction of playable video portion."""
1362 |         output_path = os.path.join(self.output_dir, f"{base_name}_extracted.mp4")
     |                       ^^^^^^^^^^^^ PTH118
1363 |
1364 |         # Determine extraction duration
     |

sources/vidbeast.py:1365:89: E501 Line too long (130 > 88)
     |
1364 |         # Determine extraction duration
1365 |         duration = min(report.playable_duration, report.total_duration) if report.total_duration > 0 else report.playable_duration
     |                                                                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ E501
1366 |
1367 |         cmd = [
     |

sources/vidbeast.py:1380:18: S603 `subprocess` call: check for execution of untrusted input
     |
1378 |         ]
1379 |
1380 |         result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=600)
     |                  ^^^^^^^^^^^^^^ S603
1381 |
1382 |         if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1024:
     |

sources/vidbeast.py:1380:89: E501 Line too long (94 > 88)
     |
1378 |         ]
1379 |
1380 |         result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=600)
     |                                                                                         ^^^^^^ E501
1381 |
1382 |         if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1024:
     |

sources/vidbeast.py:1382:39: PTH110 `os.path.exists()` should be replaced by `Path.exists()`
     |
1380 |         result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=600)
1381 |
1382 |         if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1024:
     |                                       ^^^^^^^^^^^^^^ PTH110
1383 |             # Verify the output
1384 |             verify_result = self._verify_repair(output_path)
     |
     = help: Replace with `Path(...).exists()`

sources/vidbeast.py:1382:71: PTH202 `os.path.getsize` should be replaced by `Path.stat().st_size`
     |
1380 |         result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=600)
1381 |
1382 |         if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1024:
     |                                                                       ^^^^^^^^^^^^^^^ PTH202
1383 |             # Verify the output
1384 |             verify_result = self._verify_repair(output_path)
     |
     = help: Replace with `Path(...).stat().st_size`

sources/vidbeast.py:1382:89: E501 Line too long (106 > 88)
     |
1380 |         result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=600)
1381 |
1382 |         if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1024:
     |                                                                                         ^^^^^^^^^^^^^^^^^^ E501
1383 |             # Verify the output
1384 |             verify_result = self._verify_repair(output_path)
     |

sources/vidbeast.py:1382:102: PLR2004 Magic value used in comparison, consider replacing `1024` with a constant variable
     |
1380 |         result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=600)
1381 |
1382 |         if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1024:
     |                                                                                                      ^^^^ PLR2004
1383 |             # Verify the output
1384 |             verify_result = self._verify_repair(output_path)
     |

sources/vidbeast.py:1392:89: E501 Line too long (102 > 88)
     |
1390 |                 recovered_duration=duration,
1391 |                 quality_loss="None (stream copy)",
1392 |                 notes=f"Extracted {duration:.1f}s of playable content. Verification: {verify_result}",
     |                                                                                         ^^^^^^^^^^^^^^ E501
1393 |             )
     |

sources/vidbeast.py:1401:89: E501 Line too long (99 > 88)
     |
1399 |         )
1400 |
1401 |     def _repair_container_advanced(self, report: CorruptionReport, base_name: str) -> RepairResult:
     |                                                                                         ^^^^^^^^^^^ E501
1402 |         """Advanced container structure repair."""
1403 |         output_path = os.path.join(self.output_dir, f"{base_name}_container_fixed.mp4")
     |

sources/vidbeast.py:1403:23: PTH118 `os.path.join()` should be replaced by `Path` with `/` operator
     |
1401 |     def _repair_container_advanced(self, report: CorruptionReport, base_name: str) -> RepairResult:
1402 |         """Advanced container structure repair."""
1403 |         output_path = os.path.join(self.output_dir, f"{base_name}_container_fixed.mp4")
     |                       ^^^^^^^^^^^^ PTH118
1404 |
1405 |         # Try multiple container repair approaches
     |

sources/vidbeast.py:1436:22: S603 `subprocess` call: check for execution of untrusted input
     |
1435 |         for i, cmd in enumerate(repair_approaches):
1436 |             result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=600)
     |                      ^^^^^^^^^^^^^^ S603
1437 |
1438 |             if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1024:
     |

sources/vidbeast.py:1436:89: E501 Line too long (98 > 88)
     |
1435 |         for i, cmd in enumerate(repair_approaches):
1436 |             result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=600)
     |                                                                                         ^^^^^^^^^^ E501
1437 |
1438 |             if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1024:
     |

sources/vidbeast.py:1438:43: PTH110 `os.path.exists()` should be replaced by `Path.exists()`
     |
1436 |             result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=600)
1437 |
1438 |             if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1024:
     |                                           ^^^^^^^^^^^^^^ PTH110
1439 |                 return RepairResult(
1440 |                     strategy=RepairStrategy.CONTAINER_REPAIR,
     |
     = help: Replace with `Path(...).exists()`

sources/vidbeast.py:1438:75: PTH202 `os.path.getsize` should be replaced by `Path.stat().st_size`
     |
1436 |             result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=600)
1437 |
1438 |             if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1024:
     |                                                                           ^^^^^^^^^^^^^^^ PTH202
1439 |                 return RepairResult(
1440 |                     strategy=RepairStrategy.CONTAINER_REPAIR,
     |
     = help: Replace with `Path(...).stat().st_size`

sources/vidbeast.py:1438:89: E501 Line too long (110 > 88)
     |
1436 |             result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=600)
1437 |
1438 |             if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1024:
     |                                                                                         ^^^^^^^^^^^^^^^^^^^^^^ E501
1439 |                 return RepairResult(
1440 |                     strategy=RepairStrategy.CONTAINER_REPAIR,
     |

sources/vidbeast.py:1438:106: PLR2004 Magic value used in comparison, consider replacing `1024` with a constant variable
     |
1436 |             result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=600)
1437 |
1438 |             if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1024:
     |                                                                                                          ^^^^ PLR2004
1439 |                 return RepairResult(
1440 |                     strategy=RepairStrategy.CONTAINER_REPAIR,
     |

sources/vidbeast.py:1453:9: C901 `_remux_streams_advanced` is too complex (11 > 10)
     |
1451 |         )
1452 |
1453 |     def _remux_streams_advanced(self, report: CorruptionReport, base_name: str) -> RepairResult:
     |         ^^^^^^^^^^^^^^^^^^^^^^^ C901
1454 |         """Advanced stream remuxing with individual stream extraction."""
1455 |         output_path = os.path.join(self.output_dir, f"{base_name}_remuxed.mp4")
     |

sources/vidbeast.py:1453:89: E501 Line too long (96 > 88)
     |
1451 |         )
1452 |
1453 |     def _remux_streams_advanced(self, report: CorruptionReport, base_name: str) -> RepairResult:
     |                                                                                         ^^^^^^^^ E501
1454 |         """Advanced stream remuxing with individual stream extraction."""
1455 |         output_path = os.path.join(self.output_dir, f"{base_name}_remuxed.mp4")
     |

sources/vidbeast.py:1455:23: PTH118 `os.path.join()` should be replaced by `Path` with `/` operator
     |
1453 |     def _remux_streams_advanced(self, report: CorruptionReport, base_name: str) -> RepairResult:
1454 |         """Advanced stream remuxing with individual stream extraction."""
1455 |         output_path = os.path.join(self.output_dir, f"{base_name}_remuxed.mp4")
     |                       ^^^^^^^^^^^^ PTH118
1456 |
1457 |         # First, try to extract individual streams
     |

sources/vidbeast.py:1465:34: PTH118 `os.path.join()` should be replaced by `Path` with `/` operator
     |
1463 |             for i, stream in enumerate(report.streams):
1464 |                 if stream.codec_type == "video":
1465 |                     video_path = os.path.join(temp_dir, f"video_{i}.h264")
     |                                  ^^^^^^^^^^^^ PTH118
1466 |                     cmd = [
1467 |                         self.ffmpeg_path,
     |

sources/vidbeast.py:1477:30: S603 `subprocess` call: check for execution of untrusted input
     |
1475 |                     ]
1476 |
1477 |                     result = subprocess.run(cmd, check=False, capture_output=True, timeout=300)
     |                              ^^^^^^^^^^^^^^ S603
1478 |                     if result.returncode == 0 and os.path.exists(video_path):
1479 |                         extracted_streams.append(("video", video_path))
     |

sources/vidbeast.py:1477:89: E501 Line too long (95 > 88)
     |
1475 |                     ]
1476 |
1477 |                     result = subprocess.run(cmd, check=False, capture_output=True, timeout=300)
     |                                                                                         ^^^^^^^ E501
1478 |                     if result.returncode == 0 and os.path.exists(video_path):
1479 |                         extracted_streams.append(("video", video_path))
     |

sources/vidbeast.py:1478:51: PTH110 `os.path.exists()` should be replaced by `Path.exists()`
     |
1477 |                     result = subprocess.run(cmd, check=False, capture_output=True, timeout=300)
1478 |                     if result.returncode == 0 and os.path.exists(video_path):
     |                                                   ^^^^^^^^^^^^^^ PTH110
1479 |                         extracted_streams.append(("video", video_path))
     |
     = help: Replace with `Path(...).exists()`

sources/vidbeast.py:1482:34: PTH118 `os.path.join()` should be replaced by `Path` with `/` operator
     |
1481 |                 elif stream.codec_type == "audio":
1482 |                     audio_path = os.path.join(temp_dir, f"audio_{i}.aac")
     |                                  ^^^^^^^^^^^^ PTH118
1483 |                     cmd = [
1484 |                         self.ffmpeg_path,
     |

sources/vidbeast.py:1493:30: S603 `subprocess` call: check for execution of untrusted input
     |
1491 |                     ]
1492 |
1493 |                     result = subprocess.run(cmd, check=False, capture_output=True, timeout=300)
     |                              ^^^^^^^^^^^^^^ S603
1494 |                     if result.returncode == 0 and os.path.exists(audio_path):
1495 |                         extracted_streams.append(("audio", audio_path))
     |

sources/vidbeast.py:1493:89: E501 Line too long (95 > 88)
     |
1491 |                     ]
1492 |
1493 |                     result = subprocess.run(cmd, check=False, capture_output=True, timeout=300)
     |                                                                                         ^^^^^^^ E501
1494 |                     if result.returncode == 0 and os.path.exists(audio_path):
1495 |                         extracted_streams.append(("audio", audio_path))
     |

sources/vidbeast.py:1494:51: PTH110 `os.path.exists()` should be replaced by `Path.exists()`
     |
1493 |                     result = subprocess.run(cmd, check=False, capture_output=True, timeout=300)
1494 |                     if result.returncode == 0 and os.path.exists(audio_path):
     |                                                   ^^^^^^^^^^^^^^ PTH110
1495 |                         extracted_streams.append(("audio", audio_path))
     |
     = help: Replace with `Path(...).exists()`

sources/vidbeast.py:1515:26: S603 `subprocess` call: check for execution of untrusted input
     |
1513 |                 ])
1514 |
1515 |                 result = subprocess.run(cmd, check=False, capture_output=True, timeout=600)
     |                          ^^^^^^^^^^^^^^ S603
1516 |
1517 |                 if result.returncode == 0 and os.path.exists(output_path):
     |

sources/vidbeast.py:1515:89: E501 Line too long (91 > 88)
     |
1513 |                 ])
1514 |
1515 |                 result = subprocess.run(cmd, check=False, capture_output=True, timeout=600)
     |                                                                                         ^^^ E501
1516 |
1517 |                 if result.returncode == 0 and os.path.exists(output_path):
     |

sources/vidbeast.py:1517:47: PTH110 `os.path.exists()` should be replaced by `Path.exists()`
     |
1515 |                 result = subprocess.run(cmd, check=False, capture_output=True, timeout=600)
1516 |
1517 |                 if result.returncode == 0 and os.path.exists(output_path):
     |                                               ^^^^^^^^^^^^^^ PTH110
1518 |                     return RepairResult(
1519 |                         strategy=RepairStrategy.STREAM_REMUX,
     |
     = help: Replace with `Path(...).exists()`

sources/vidbeast.py:1543:18: S603 `subprocess` call: check for execution of untrusted input
     |
1541 |         ]
1542 |
1543 |         result = subprocess.run(cmd, check=False, capture_output=True, timeout=600)
     |                  ^^^^^^^^^^^^^^ S603
1544 |
1545 |         if result.returncode == 0 and os.path.exists(output_path):
     |

sources/vidbeast.py:1545:39: PTH110 `os.path.exists()` should be replaced by `Path.exists()`
     |
1543 |         result = subprocess.run(cmd, check=False, capture_output=True, timeout=600)
1544 |
1545 |         if result.returncode == 0 and os.path.exists(output_path):
     |                                       ^^^^^^^^^^^^^^ PTH110
1546 |             return RepairResult(
1547 |                 strategy=RepairStrategy.STREAM_REMUX,
     |
     = help: Replace with `Path(...).exists()`

sources/vidbeast.py:1560:89: E501 Line too long (94 > 88)
     |
1558 |         )
1559 |
1560 |     def _deep_repair_advanced(self, report: CorruptionReport, base_name: str) -> RepairResult:
     |                                                                                         ^^^^^^ E501
1561 |         """Deep repair with full re-encoding and advanced error concealment."""
1562 |         output_path = os.path.join(self.output_dir, f"{base_name}_deep_repaired.mp4")
     |

sources/vidbeast.py:1562:23: PTH118 `os.path.join()` should be replaced by `Path` with `/` operator
     |
1560 |     def _deep_repair_advanced(self, report: CorruptionReport, base_name: str) -> RepairResult:
1561 |         """Deep repair with full re-encoding and advanced error concealment."""
1562 |         output_path = os.path.join(self.output_dir, f"{base_name}_deep_repaired.mp4")
     |                       ^^^^^^^^^^^^ PTH118
1563 |
1564 |         # Build encoding command with GPU acceleration if available
     |

sources/vidbeast.py:1604:18: S603 `subprocess` call: check for execution of untrusted input
     |
1602 |         ])
1603 |
1604 |         result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=1800)  # 30 min timeout
     |                  ^^^^^^^^^^^^^^ S603
1605 |
1606 |         if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1024:
     |

sources/vidbeast.py:1604:89: E501 Line too long (113 > 88)
     |
1602 |         ])
1603 |
1604 |         result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=1800)  # 30 min timeout
     |                                                                                         ^^^^^^^^^^^^^^^^^^^^^^^^^ E501
1605 |
1606 |         if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1024:
     |

sources/vidbeast.py:1606:39: PTH110 `os.path.exists()` should be replaced by `Path.exists()`
     |
1604 |         result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=1800)  # 30 min timeout
1605 |
1606 |         if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1024:
     |                                       ^^^^^^^^^^^^^^ PTH110
1607 |             return RepairResult(
1608 |                 strategy=RepairStrategy.DEEP_REPAIR,
     |
     = help: Replace with `Path(...).exists()`

sources/vidbeast.py:1606:71: PTH202 `os.path.getsize` should be replaced by `Path.stat().st_size`
     |
1604 |         result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=1800)  # 30 min timeout
1605 |
1606 |         if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1024:
     |                                                                       ^^^^^^^^^^^^^^^ PTH202
1607 |             return RepairResult(
1608 |                 strategy=RepairStrategy.DEEP_REPAIR,
     |
     = help: Replace with `Path(...).stat().st_size`

sources/vidbeast.py:1606:89: E501 Line too long (106 > 88)
     |
1604 |         result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=1800)  # 30 min timeout
1605 |
1606 |         if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1024:
     |                                                                                         ^^^^^^^^^^^^^^^^^^ E501
1607 |             return RepairResult(
1608 |                 strategy=RepairStrategy.DEEP_REPAIR,
     |

sources/vidbeast.py:1606:102: PLR2004 Magic value used in comparison, consider replacing `1024` with a constant variable
     |
1604 |         result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=1800)  # 30 min timeout
1605 |
1606 |         if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1024:
     |                                                                                                      ^^^^ PLR2004
1607 |             return RepairResult(
1608 |                 strategy=RepairStrategy.DEEP_REPAIR,
     |

sources/vidbeast.py:1611:89: E501 Line too long (104 > 88)
     |
1609 |                 success=True,
1610 |                 output_path=output_path,
1611 |                 quality_loss="Minimal (CRF 23)" if not self.gpu_acceleration else "Minimal (5Mbps VBR)",
     |                                                                                         ^^^^^^^^^^^^^^^^ E501
1612 |                 notes="Full re-encoding completed with error concealment",
1613 |             )
     |

sources/vidbeast.py:1621:89: E501 Line too long (91 > 88)
     |
1619 |         )
1620 |
1621 |     def _rebuild_keyframes(self, report: CorruptionReport, base_name: str) -> RepairResult:
     |                                                                                         ^^^ E501
1622 |         """Rebuild video with forced keyframe intervals."""
1623 |         output_path = os.path.join(self.output_dir, f"{base_name}_keyframes_rebuilt.mp4")
     |

sources/vidbeast.py:1623:23: PTH118 `os.path.join()` should be replaced by `Path` with `/` operator
     |
1621 |     def _rebuild_keyframes(self, report: CorruptionReport, base_name: str) -> RepairResult:
1622 |         """Rebuild video with forced keyframe intervals."""
1623 |         output_path = os.path.join(self.output_dir, f"{base_name}_keyframes_rebuilt.mp4")
     |                       ^^^^^^^^^^^^ PTH118
1624 |
1625 |         cmd = [
     |

sources/vidbeast.py:1623:89: E501 Line too long (89 > 88)
     |
1621 |     def _rebuild_keyframes(self, report: CorruptionReport, base_name: str) -> RepairResult:
1622 |         """Rebuild video with forced keyframe intervals."""
1623 |         output_path = os.path.join(self.output_dir, f"{base_name}_keyframes_rebuilt.mp4")
     |                                                                                         ^ E501
1624 |
1625 |         cmd = [
     |

sources/vidbeast.py:1642:18: S603 `subprocess` call: check for execution of untrusted input
     |
1640 |         ]
1641 |
1642 |         result = subprocess.run(cmd, check=False, capture_output=True, timeout=1800)
     |                  ^^^^^^^^^^^^^^ S603
1643 |
1644 |         if result.returncode == 0 and os.path.exists(output_path):
     |

sources/vidbeast.py:1644:39: PTH110 `os.path.exists()` should be replaced by `Path.exists()`
     |
1642 |         result = subprocess.run(cmd, check=False, capture_output=True, timeout=1800)
1643 |
1644 |         if result.returncode == 0 and os.path.exists(output_path):
     |                                       ^^^^^^^^^^^^^^ PTH110
1645 |             return RepairResult(
1646 |                 strategy=RepairStrategy.KEYFRAME_REBUILD,
     |
     = help: Replace with `Path(...).exists()`

sources/vidbeast.py:1661:23: PTH118 `os.path.join()` should be replaced by `Path` with `/` operator
     |
1659 |     def _fix_timestamps(self, report: CorruptionReport, base_name: str) -> RepairResult:
1660 |         """Fix timestamp issues with advanced filters."""
1661 |         output_path = os.path.join(self.output_dir, f"{base_name}_timestamps_fixed.mp4")
     |                       ^^^^^^^^^^^^ PTH118
1662 |
1663 |         cmd = [
     |

sources/vidbeast.py:1678:18: S603 `subprocess` call: check for execution of untrusted input
     |
1676 |         ]
1677 |
1678 |         result = subprocess.run(cmd, check=False, capture_output=True, timeout=1800)
     |                  ^^^^^^^^^^^^^^ S603
1679 |
1680 |         if result.returncode == 0 and os.path.exists(output_path):
     |

sources/vidbeast.py:1680:39: PTH110 `os.path.exists()` should be replaced by `Path.exists()`
     |
1678 |         result = subprocess.run(cmd, check=False, capture_output=True, timeout=1800)
1679 |
1680 |         if result.returncode == 0 and os.path.exists(output_path):
     |                                       ^^^^^^^^^^^^^^ PTH110
1681 |             return RepairResult(
1682 |                 strategy=RepairStrategy.TIMESTAMP_FIX,
     |
     = help: Replace with `Path(...).exists()`

sources/vidbeast.py:1695:89: E501 Line too long (90 > 88)
     |
1693 |         )
1694 |
1695 |     def _segment_recovery(self, report: CorruptionReport, base_name: str) -> RepairResult:
     |                                                                                         ^^ E501
1696 |         """Advanced segment-based recovery for severely corrupted files."""
1697 |         output_path = os.path.join(self.output_dir, f"{base_name}_segments_recovered.mp4")
     |

sources/vidbeast.py:1697:23: PTH118 `os.path.join()` should be replaced by `Path` with `/` operator
     |
1695 |     def _segment_recovery(self, report: CorruptionReport, base_name: str) -> RepairResult:
1696 |         """Advanced segment-based recovery for severely corrupted files."""
1697 |         output_path = os.path.join(self.output_dir, f"{base_name}_segments_recovered.mp4")
     |                       ^^^^^^^^^^^^ PTH118
1698 |         temp_dir = tempfile.mkdtemp()
     |

sources/vidbeast.py:1697:89: E501 Line too long (90 > 88)
     |
1695 |     def _segment_recovery(self, report: CorruptionReport, base_name: str) -> RepairResult:
1696 |         """Advanced segment-based recovery for severely corrupted files."""
1697 |         output_path = os.path.join(self.output_dir, f"{base_name}_segments_recovered.mp4")
     |                                                                                         ^^ E501
1698 |         temp_dir = tempfile.mkdtemp()
     |

sources/vidbeast.py:1711:32: PTH118 `os.path.join()` should be replaced by `Path` with `/` operator
     |
1709 |             for i in range(num_segments):
1710 |                 start_time = i * segment_duration
1711 |                 segment_path = os.path.join(temp_dir, f"segment_{i:04d}.mp4")
     |                                ^^^^^^^^^^^^ PTH118
1712 |
1713 |                 cmd = [
     |

sources/vidbeast.py:1724:26: S603 `subprocess` call: check for execution of untrusted input
     |
1722 |                 ]
1723 |
1724 |                 result = subprocess.run(cmd, check=False, capture_output=True, timeout=30)
     |                          ^^^^^^^^^^^^^^ S603
1725 |
1726 |                 if result.returncode == 0 and os.path.exists(segment_path) and os.path.getsize(segment_path) > 1024:
     |

sources/vidbeast.py:1724:89: E501 Line too long (90 > 88)
     |
1722 |                 ]
1723 |
1724 |                 result = subprocess.run(cmd, check=False, capture_output=True, timeout=30)
     |                                                                                         ^^ E501
1725 |
1726 |                 if result.returncode == 0 and os.path.exists(segment_path) and os.path.getsize(segment_path) > 1024:
     |

sources/vidbeast.py:1726:47: PTH110 `os.path.exists()` should be replaced by `Path.exists()`
     |
1724 |                 result = subprocess.run(cmd, check=False, capture_output=True, timeout=30)
1725 |
1726 |                 if result.returncode == 0 and os.path.exists(segment_path) and os.path.getsize(segment_path) > 1024:
     |                                               ^^^^^^^^^^^^^^ PTH110
1727 |                     valid_segments.append(segment_path)
1728 |                 else:
     |
     = help: Replace with `Path(...).exists()`

sources/vidbeast.py:1726:80: PTH202 `os.path.getsize` should be replaced by `Path.stat().st_size`
     |
1724 |                 result = subprocess.run(cmd, check=False, capture_output=True, timeout=30)
1725 |
1726 |                 if result.returncode == 0 and os.path.exists(segment_path) and os.path.getsize(segment_path) > 1024:
     |                                                                                ^^^^^^^^^^^^^^^ PTH202
1727 |                     valid_segments.append(segment_path)
1728 |                 else:
     |
     = help: Replace with `Path(...).stat().st_size`

sources/vidbeast.py:1726:89: E501 Line too long (116 > 88)
     |
1724 |                 result = subprocess.run(cmd, check=False, capture_output=True, timeout=30)
1725 |
1726 |                 if result.returncode == 0 and os.path.exists(segment_path) and os.path.getsize(segment_path) > 1024:
     |                                                                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ E501
1727 |                     valid_segments.append(segment_path)
1728 |                 else:
     |

sources/vidbeast.py:1726:112: PLR2004 Magic value used in comparison, consider replacing `1024` with a constant variable
     |
1724 |                 result = subprocess.run(cmd, check=False, capture_output=True, timeout=30)
1725 |
1726 |                 if result.returncode == 0 and os.path.exists(segment_path) and os.path.getsize(segment_path) > 1024:
     |                                                                                                                ^^^^ PLR2004
1727 |                     valid_segments.append(segment_path)
1728 |                 else:
     |

sources/vidbeast.py:1733:30: S603 `subprocess` call: check for execution of untrusted input
     |
1731 |                     cmd.extend(["-preset", "ultrafast"])
1732 |
1733 |                     result = subprocess.run(cmd, check=False, capture_output=True, timeout=60)
     |                              ^^^^^^^^^^^^^^ S603
1734 |
1735 |                     if result.returncode == 0 and os.path.exists(segment_path):
     |

sources/vidbeast.py:1733:89: E501 Line too long (94 > 88)
     |
1731 |                     cmd.extend(["-preset", "ultrafast"])
1732 |
1733 |                     result = subprocess.run(cmd, check=False, capture_output=True, timeout=60)
     |                                                                                         ^^^^^^ E501
1734 |
1735 |                     if result.returncode == 0 and os.path.exists(segment_path):
     |

sources/vidbeast.py:1735:51: PTH110 `os.path.exists()` should be replaced by `Path.exists()`
     |
1733 |                     result = subprocess.run(cmd, check=False, capture_output=True, timeout=60)
1734 |
1735 |                     if result.returncode == 0 and os.path.exists(segment_path):
     |                                                   ^^^^^^^^^^^^^^ PTH110
1736 |                         valid_segments.append(segment_path)
     |
     = help: Replace with `Path(...).exists()`

sources/vidbeast.py:1740:31: PTH118 `os.path.join()` should be replaced by `Path` with `/` operator
     |
1738 |             if valid_segments:
1739 |                 # Create concat file
1740 |                 concat_file = os.path.join(temp_dir, "concat.txt")
     |                               ^^^^^^^^^^^^ PTH118
1741 |                 with open(concat_file, "w") as f:
1742 |                     f.writelines(f"file '{segment}'\n" for segment in valid_segments)
     |

sources/vidbeast.py:1741:22: PTH123 `open()` should be replaced by `Path.open()`
     |
1739 |                 # Create concat file
1740 |                 concat_file = os.path.join(temp_dir, "concat.txt")
1741 |                 with open(concat_file, "w") as f:
     |                      ^^^^ PTH123
1742 |                     f.writelines(f"file '{segment}'\n" for segment in valid_segments)
     |

sources/vidbeast.py:1755:26: S603 `subprocess` call: check for execution of untrusted input
     |
1753 |                 ]
1754 |
1755 |                 result = subprocess.run(cmd, check=False, capture_output=True, timeout=600)
     |                          ^^^^^^^^^^^^^^ S603
1756 |
1757 |                 if result.returncode == 0 and os.path.exists(output_path):
     |

sources/vidbeast.py:1755:89: E501 Line too long (91 > 88)
     |
1753 |                 ]
1754 |
1755 |                 result = subprocess.run(cmd, check=False, capture_output=True, timeout=600)
     |                                                                                         ^^^ E501
1756 |
1757 |                 if result.returncode == 0 and os.path.exists(output_path):
     |

sources/vidbeast.py:1757:47: PTH110 `os.path.exists()` should be replaced by `Path.exists()`
     |
1755 |                 result = subprocess.run(cmd, check=False, capture_output=True, timeout=600)
1756 |
1757 |                 if result.returncode == 0 and os.path.exists(output_path):
     |                                               ^^^^^^^^^^^^^^ PTH110
1758 |                     recovered_duration = len(valid_segments) * segment_duration
1759 |                     return RepairResult(
     |
     = help: Replace with `Path(...).exists()`

sources/vidbeast.py:1765:89: E501 Line too long (98 > 88)
     |
1763 |                         recovered_duration=recovered_duration,
1764 |                         quality_loss="Variable (mixed copy/re-encode)",
1765 |                         notes=f"Recovered {len(valid_segments)} segments ({recovered_duration}s)",
     |                                                                                         ^^^^^^^^^^ E501
1766 |                     )
     |

sources/vidbeast.py:1788:22: S603 `subprocess` call: check for execution of untrusted input
     |
1786 |             ]
1787 |
1788 |             result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=10)
     |                      ^^^^^^^^^^^^^^ S603
1789 |
1790 |             if result.returncode == 0:
     |

sources/vidbeast.py:1788:89: E501 Line too long (97 > 88)
     |
1786 |             ]
1787 |
1788 |             result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=10)
     |                                                                                         ^^^^^^^^^ E501
1789 |
1790 |             if result.returncode == 0:
     |

sources/vidbeast.py:1794:13: TRY300 Consider moving this statement to an `else` block
     |
1792 |                 duration = float(data["format"]["duration"])
1793 |                 return f"Valid ({duration:.1f}s)"
1794 |             return "Invalid output"
     |             ^^^^^^^^^^^^^^^^^^^^^^^ TRY300
1795 |
1796 |         except Exception:
     |

sources/vidbeast.py:1796:16: BLE001 Do not catch blind exception: `Exception`
     |
1794 |             return "Invalid output"
1795 |
1796 |         except Exception:
     |                ^^^^^^^^^ BLE001
1797 |             return "Verification failed"
     |

sources/vidbeast.py:1799:89: E501 Line too long (110 > 88)
     |
1797 |             return "Verification failed"
1798 |
1799 |     def extract_frames_to_png(self, report: CorruptionReport, output_dir: str, frame_rate: str = "1") -> bool:
     |                                                                                         ^^^^^^^^^^^^^^^^^^^^^^ E501
1800 |         """Extract video frames to PNG files for forensic analysis."""
1801 |         try:
     |

sources/vidbeast.py:1804:13: PTH103 `os.makedirs()` should be replaced by `Path.mkdir(parents=True)`
     |
1802 |             self.log(f"Extracting frames to PNG at {frame_rate} fps")
1803 |
1804 |             os.makedirs(output_dir, exist_ok=True)
     |             ^^^^^^^^^^^ PTH103
1805 |
1806 |             base_name = os.path.splitext(os.path.basename(report.file_path))[0]
     |

sources/vidbeast.py:1806:25: PTH122 `os.path.splitext()` should be replaced by `Path.suffix`, `Path.stem`, and `Path.parent`
     |
1804 |             os.makedirs(output_dir, exist_ok=True)
1805 |
1806 |             base_name = os.path.splitext(os.path.basename(report.file_path))[0]
     |                         ^^^^^^^^^^^^^^^^ PTH122
1807 |             output_pattern = os.path.join(output_dir, f"{base_name}_frame_%06d.png")
     |

sources/vidbeast.py:1806:42: PTH119 `os.path.basename()` should be replaced by `Path.name`
     |
1804 |             os.makedirs(output_dir, exist_ok=True)
1805 |
1806 |             base_name = os.path.splitext(os.path.basename(report.file_path))[0]
     |                                          ^^^^^^^^^^^^^^^^ PTH119
1807 |             output_pattern = os.path.join(output_dir, f"{base_name}_frame_%06d.png")
     |
     = help: Replace with `Path(...).name`

sources/vidbeast.py:1807:30: PTH118 `os.path.join()` should be replaced by `Path` with `/` operator
     |
1806 |             base_name = os.path.splitext(os.path.basename(report.file_path))[0]
1807 |             output_pattern = os.path.join(output_dir, f"{base_name}_frame_%06d.png")
     |                              ^^^^^^^^^^^^ PTH118
1808 |
1809 |             cmd = [
     |

sources/vidbeast.py:1818:22: S603 `subprocess` call: check for execution of untrusted input
     |
1816 |             ]
1817 |
1818 |             result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=600)
     |                      ^^^^^^^^^^^^^^ S603
1819 |
1820 |             if result.returncode == 0:
     |

sources/vidbeast.py:1818:89: E501 Line too long (98 > 88)
     |
1816 |             ]
1817 |
1818 |             result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=600)
     |                                                                                         ^^^^^^^^^^ E501
1819 |
1820 |             if result.returncode == 0:
     |

sources/vidbeast.py:1821:43: PTH208 Use `pathlib.Path.iterdir()` instead.
     |
1820 |             if result.returncode == 0:
1821 |                 frame_files = [f for f in os.listdir(output_dir)
     |                                           ^^^^^^^^^^ PTH208
1822 |                              if f.startswith(f"{base_name}_frame_") and f.endswith(".png")]
1823 |                 self.log(f"Successfully extracted {len(frame_files)} frames to {output_dir}")
     |

sources/vidbeast.py:1822:89: E501 Line too long (91 > 88)
     |
1820 |             if result.returncode == 0:
1821 |                 frame_files = [f for f in os.listdir(output_dir)
1822 |                              if f.startswith(f"{base_name}_frame_") and f.endswith(".png")]
     |                                                                                         ^^^ E501
1823 |                 self.log(f"Successfully extracted {len(frame_files)} frames to {output_dir}")
1824 |                 return True
     |

sources/vidbeast.py:1823:89: E501 Line too long (93 > 88)
     |
1821 |                 frame_files = [f for f in os.listdir(output_dir)
1822 |                              if f.startswith(f"{base_name}_frame_") and f.endswith(".png")]
1823 |                 self.log(f"Successfully extracted {len(frame_files)} frames to {output_dir}")
     |                                                                                         ^^^^^ E501
1824 |                 return True
1825 |             self.log(f"Frame extraction failed: {result.stderr}")
     |

sources/vidbeast.py:1826:13: TRY300 Consider moving this statement to an `else` block
     |
1824 |                 return True
1825 |             self.log(f"Frame extraction failed: {result.stderr}")
1826 |             return False
     |             ^^^^^^^^^^^^ TRY300
1827 |
1828 |         except Exception as e:
     |

sources/vidbeast.py:1828:16: BLE001 Do not catch blind exception: `Exception`
     |
1826 |             return False
1827 |
1828 |         except Exception as e:
     |                ^^^^^^^^^ BLE001
1829 |             self.log(f"Frame extraction error: {e}")
1830 |             return False
     |

sources/vidbeast.py:1832:89: E501 Line too long (109 > 88)
     |
1830 |             return False
1831 |
1832 |     def batch_analyze(self, file_paths: list[str], max_workers: int | None = None) -> list[CorruptionReport]:
     |                                                                                         ^^^^^^^^^^^^^^^^^^^^^ E501
1833 |         """Analyze multiple files in parallel."""
1834 |         if max_workers is None:
     |

sources/vidbeast.py:1840:89: E501 Line too long (94 > 88)
     |
1839 |         with ThreadPoolExecutor(max_workers=max_workers) as executor:
1840 |             future_to_file = {executor.submit(self.analyze_file, fp): fp for fp in file_paths}
     |                                                                                         ^^^^^^ E501
1841 |
1842 |             for future in as_completed(future_to_file):
     |

sources/vidbeast.py:1847:24: BLE001 Do not catch blind exception: `Exception`
     |
1845 |                     report = future.result()
1846 |                     reports.append(report)
1847 |                 except Exception as e:
     |                        ^^^^^^^^^ BLE001
1848 |                     self.log(f"Error analyzing {file_path}: {e}")
1849 |                     # Create error report
     |

sources/vidbeast.py:1870:5: C901 `print_report` is too complex (15 > 10)
     |
1868 |     """Print VidBeast banner."""
1869 |
1870 | def print_report(report: CorruptionReport, detailed: bool = False) -> None:
     |     ^^^^^^^^^^^^ C901
1871 |     """Print corruption analysis report."""
1872 |     if report.corruption_types:
     |

sources/vidbeast.py:1870:5: PLR0912 Too many branches (14 > 12)
     |
1868 |     """Print VidBeast banner."""
1869 |
1870 | def print_report(report: CorruptionReport, detailed: bool = False) -> None:
     |     ^^^^^^^^^^^^ PLR0912
1871 |     """Print corruption analysis report."""
1872 |     if report.corruption_types:
     |

sources/vidbeast.py:1870:44: FBT001 Boolean-typed positional argument in function definition
     |
1868 |     """Print VidBeast banner."""
1869 |
1870 | def print_report(report: CorruptionReport, detailed: bool = False) -> None:
     |                                            ^^^^^^^^ FBT001
1871 |     """Print corruption analysis report."""
1872 |     if report.corruption_types:
     |

sources/vidbeast.py:1870:44: FBT002 Boolean default positional argument in function definition
     |
1868 |     """Print VidBeast banner."""
1869 |
1870 | def print_report(report: CorruptionReport, detailed: bool = False) -> None:
     |                                            ^^^^^^^^ FBT002
1871 |     """Print corruption analysis report."""
1872 |     if report.corruption_types:
     |

sources/vidbeast.py:1879:5: SIM102 Use a single `if` statement instead of nested `if` statements
     |
1877 |               pass
1878 |
1879 | /     if report.is_playable and report.playable_duration > 0:
1880 | |         if report.total_duration > 0:
     | |_____________________________________^ SIM102
1881 |               (report.playable_duration / report.total_duration) * 100
     |
     = help: Combine `if` statements using `and`

sources/vidbeast.py:1901:5: C901 `main` is too complex (29 > 10)
     |
1899 |         pass
1900 |
1901 | def main() -> int:
     |     ^^^^ C901
1902 |     parser = argparse.ArgumentParser(
1903 |         description="VidBeast - Advanced Video Corruption Analysis & Repair Engine",
     |

sources/vidbeast.py:1901:5: PLR0912 Too many branches (32 > 12)
     |
1899 |         pass
1900 |
1901 | def main() -> int:
     |     ^^^^ PLR0912
1902 |     parser = argparse.ArgumentParser(
1903 |         description="VidBeast - Advanced Video Corruption Analysis & Repair Engine",
     |

sources/vidbeast.py:1901:5: PLR0915 Too many statements (68 > 50)
     |
1899 |         pass
1900 |
1901 | def main() -> int:
     |     ^^^^ PLR0915
1902 |     parser = argparse.ArgumentParser(
1903 |         description="VidBeast - Advanced Video Corruption Analysis & Repair Engine",
     |

sources/vidbeast.py:1901:5: D103 Missing docstring in public function
     |
1899 |         pass
1900 |
1901 | def main() -> int:
     |     ^^^^ D103
1902 |     parser = argparse.ArgumentParser(
1903 |         description="VidBeast - Advanced Video Corruption Analysis & Repair Engine",
     |

sources/vidbeast.py:1909:89: E501 Line too long (95 > 88)
     |
1907 |     parser.add_argument("input", help="Input video file or directory")
1908 |     parser.add_argument("-v", "--verbose", action="store_true", help="Verbose output")
1909 |     parser.add_argument("-d", "--detailed", action="store_true", help="Show detailed analysis")
     |                                                                                         ^^^^^^^ E501
1910 |     parser.add_argument("-r", "--recursive", action="store_true", help="Process directories recursively")
1911 |     parser.add_argument("-o", "--output", help="Output directory for repaired files")
     |

sources/vidbeast.py:1910:89: E501 Line too long (105 > 88)
     |
1908 |     parser.add_argument("-v", "--verbose", action="store_true", help="Verbose output")
1909 |     parser.add_argument("-d", "--detailed", action="store_true", help="Show detailed analysis")
1910 |     parser.add_argument("-r", "--recursive", action="store_true", help="Process directories recursively")
     |                                                                                         ^^^^^^^^^^^^^^^^^ E501
1911 |     parser.add_argument("-o", "--output", help="Output directory for repaired files")
1912 |     parser.add_argument("--repair", action="store_true", help="Enable repair mode - actually fix corrupted files")
     |

sources/vidbeast.py:1912:89: E501 Line too long (114 > 88)
     |
1910 |     parser.add_argument("-r", "--recursive", action="store_true", help="Process directories recursively")
1911 |     parser.add_argument("-o", "--output", help="Output directory for repaired files")
1912 |     parser.add_argument("--repair", action="store_true", help="Enable repair mode - actually fix corrupted files")
     |                                                                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^ E501
1913 |     parser.add_argument("--extract-frames", help="Extract frames to PNG files (specify output directory)")
1914 |     parser.add_argument("--frame-rate", default="1", help="Frame extraction rate (default: 1 fps)")
     |

sources/vidbeast.py:1913:89: E501 Line too long (106 > 88)
     |
1911 |     parser.add_argument("-o", "--output", help="Output directory for repaired files")
1912 |     parser.add_argument("--repair", action="store_true", help="Enable repair mode - actually fix corrupted files")
1913 |     parser.add_argument("--extract-frames", help="Extract frames to PNG files (specify output directory)")
     |                                                                                         ^^^^^^^^^^^^^^^^^^ E501
1914 |     parser.add_argument("--frame-rate", default="1", help="Frame extraction rate (default: 1 fps)")
1915 |     parser.add_argument("--max-threads", type=int, default=4, help="Maximum parallel processing threads")
     |

sources/vidbeast.py:1914:89: E501 Line too long (99 > 88)
     |
1912 |     parser.add_argument("--repair", action="store_true", help="Enable repair mode - actually fix corrupted files")
1913 |     parser.add_argument("--extract-frames", help="Extract frames to PNG files (specify output directory)")
1914 |     parser.add_argument("--frame-rate", default="1", help="Frame extraction rate (default: 1 fps)")
     |                                                                                         ^^^^^^^^^^^ E501
1915 |     parser.add_argument("--max-threads", type=int, default=4, help="Maximum parallel processing threads")
1916 |     parser.add_argument("--gpu", action="store_true", help="Enable GPU acceleration for repairs")
     |

sources/vidbeast.py:1915:89: E501 Line too long (105 > 88)
     |
1913 |     parser.add_argument("--extract-frames", help="Extract frames to PNG files (specify output directory)")
1914 |     parser.add_argument("--frame-rate", default="1", help="Frame extraction rate (default: 1 fps)")
1915 |     parser.add_argument("--max-threads", type=int, default=4, help="Maximum parallel processing threads")
     |                                                                                         ^^^^^^^^^^^^^^^^^ E501
1916 |     parser.add_argument("--gpu", action="store_true", help="Enable GPU acceleration for repairs")
1917 |     parser.add_argument("--format", choices=["text", "json", "csv"], default="text", help="Output format")
     |

sources/vidbeast.py:1916:89: E501 Line too long (97 > 88)
     |
1914 |     parser.add_argument("--frame-rate", default="1", help="Frame extraction rate (default: 1 fps)")
1915 |     parser.add_argument("--max-threads", type=int, default=4, help="Maximum parallel processing threads")
1916 |     parser.add_argument("--gpu", action="store_true", help="Enable GPU acceleration for repairs")
     |                                                                                         ^^^^^^^^^ E501
1917 |     parser.add_argument("--format", choices=["text", "json", "csv"], default="text", help="Output format")
     |

sources/vidbeast.py:1917:89: E501 Line too long (106 > 88)
     |
1915 |     parser.add_argument("--max-threads", type=int, default=4, help="Maximum parallel processing threads")
1916 |     parser.add_argument("--gpu", action="store_true", help="Enable GPU acceleration for repairs")
1917 |     parser.add_argument("--format", choices=["text", "json", "csv"], default="text", help="Output format")
     |                                                                                         ^^^^^^^^^^^^^^^^^^ E501
1918 |
1919 |     args = parser.parse_args()
     |

sources/vidbeast.py:1937:12: PTH113 `os.path.isfile()` should be replaced by `Path.is_file()`
     |
1936 |         # Process input
1937 |         if os.path.isfile(args.input):
     |            ^^^^^^^^^^^^^^ PTH113
1938 |             # Single file
1939 |             report = vidbeast.analyze_file(args.input)
     |
     = help: Replace with `Path(...).is_file()`

sources/vidbeast.py:1953:89: E501 Line too long (102 > 88)
     |
1951 |                 if args.format == "text":
1952 |                     pass
1953 |                 success = vidbeast.extract_frames_to_png(report, args.extract_frames, args.frame_rate)
     |                                                                                         ^^^^^^^^^^^^^^ E501
1954 |                 if args.format == "text":
1955 |                     if success:
     |

sources/vidbeast.py:1960:14: PTH112 `os.path.isdir()` should be replaced by `Path.is_dir()`
     |
1958 |                         pass
1959 |
1960 |         elif os.path.isdir(args.input):
     |              ^^^^^^^^^^^^^ PTH112
1961 |             # Directory processing
1962 |             if args.format == "text":
     |
     = help: Replace with `Path(...).is_dir()`

sources/vidbeast.py:1970:29: PERF401 Use `list.extend` to create a transformed list
     |
1968 |                     for file in files:
1969 |                         if any(file.lower().endswith(ext) for ext in SUPPORTED_FORMATS):
1970 |                             files_found.append(os.path.join(root, file))
     |                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ PERF401
1971 |             else:
1972 |                 for file in os.listdir(args.input):
     |
     = help: Replace for loop with list.extend

sources/vidbeast.py:1970:48: PTH118 `os.path.join()` should be replaced by `Path` with `/` operator
     |
1968 |                     for file in files:
1969 |                         if any(file.lower().endswith(ext) for ext in SUPPORTED_FORMATS):
1970 |                             files_found.append(os.path.join(root, file))
     |                                                ^^^^^^^^^^^^ PTH118
1971 |             else:
1972 |                 for file in os.listdir(args.input):
     |

sources/vidbeast.py:1972:29: PTH208 Use `pathlib.Path.iterdir()` instead.
     |
1970 |                             files_found.append(os.path.join(root, file))
1971 |             else:
1972 |                 for file in os.listdir(args.input):
     |                             ^^^^^^^^^^ PTH208
1973 |                     file_path = os.path.join(args.input, file)
1974 |                     if os.path.isfile(file_path) and any(file.lower().endswith(ext) for ext in SUPPORTED_FORMATS):
     |

sources/vidbeast.py:1973:33: PTH118 `os.path.join()` should be replaced by `Path` with `/` operator
     |
1971 |             else:
1972 |                 for file in os.listdir(args.input):
1973 |                     file_path = os.path.join(args.input, file)
     |                                 ^^^^^^^^^^^^ PTH118
1974 |                     if os.path.isfile(file_path) and any(file.lower().endswith(ext) for ext in SUPPORTED_FORMATS):
1975 |                         files_found.append(file_path)
     |

sources/vidbeast.py:1974:24: PTH113 `os.path.isfile()` should be replaced by `Path.is_file()`
     |
1972 |                 for file in os.listdir(args.input):
1973 |                     file_path = os.path.join(args.input, file)
1974 |                     if os.path.isfile(file_path) and any(file.lower().endswith(ext) for ext in SUPPORTED_FORMATS):
     |                        ^^^^^^^^^^^^^^ PTH113
1975 |                         files_found.append(file_path)
     |
     = help: Replace with `Path(...).is_file()`

sources/vidbeast.py:1974:89: E501 Line too long (114 > 88)
     |
1972 |                 for file in os.listdir(args.input):
1973 |                     file_path = os.path.join(args.input, file)
1974 |                     if os.path.isfile(file_path) and any(file.lower().endswith(ext) for ext in SUPPORTED_FORMATS):
     |                                                                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^ E501
1975 |                         files_found.append(file_path)
     |

sources/vidbeast.py:2002:89: E501 Line too long (107 > 88)
     |
2000 |                     "summary": {
2001 |                         "total_files": len(reports),
2002 |                         "corrupted": sum(1 for r in reports if r.corruption_level != CorruptionLevel.NONE),
     |                                                                                         ^^^^^^^^^^^^^^^^^^^ E501
2003 |                         "repairable": sum(1 for r in reports if r.repair_feasible),
2004 |                     },
     |

sources/vidbeast.py:2009:21: B007 Loop control variable `report` not used within loop body
     |
2008 |             elif args.format == "csv":
2009 |                 for report in reports:
     |                     ^^^^^^ B007
2010 |                     pass
     |
     = help: Rename unused `report` to `_report`

sources/vidbeast.py:2015:12: BLE001 Do not catch blind exception: `Exception`
     |
2013 |             return 1
2014 |
2015 |     except Exception:
     |            ^^^^^^^^^ BLE001
2016 |         if args.format == "text":
2017 |             pass
     |

Found 246 errors.
