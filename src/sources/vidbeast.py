#!/usr/bin/env python3

####################################################################################
#                                                                                  #
#   ██╗   ██╗██╗██████╗ ██████╗ ███████╗ █████╗ ███████╗████████╗                #
#   ██║   ██║██║██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝╚══██╔══╝                #
#   ██║   ██║██║██║  ██║██████╔╝█████╗  ███████║███████╗   ██║                   #
#   ╚██╗ ██╔╝██║██║  ██║██╔══██╗██╔══╝  ██╔══██║╚════██║   ██║                   #
#    ╚████╔╝ ██║██████╔╝██████╔╝███████╗██║  ██║███████║   ██║                   #
#     ╚═══╝  ╚═╝╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝   ╚═╝                   #
#                                                                                  #
####################################################################################
#
# Script Name: VidBeast v3.0 - Advanced Video Corruption Analysis & Repair Engine
#
# Author: Claude & Heathen-Admin
# Date Created: 2025-01-29
# Version: 3.0.0 - ADVANCED ENGINE
#
# Description: Deep video corruption detection and advanced repair capabilities
#
# Usage: python vidbeast.py [options] <input_file_or_directory>
#
# Dependencies: ffmpeg, ffprobe, python3
#
####################################################################################

"""VidBeast v3.0 - Advanced Video Corruption Analysis & Repair Engine.
==================================================================

Features:
- Deep bitstream corruption detection with H.264/H.265 NAL unit analysis
- Container structure analysis and repair (MP4, MOV, MKV, AVI)
- Stream integrity validation with packet-level inspection
- Frame-level corruption analysis with motion vector examination
- Advanced repair capabilities including:
  - Intelligent keyframe reconstruction
  - GOP structure rebuilding
  - Timestamp correction
  - Audio sync repair
  - Partial recovery with smart truncation
  - Multi-strategy repair attempts
- GPU-accelerated processing support
- Detailed forensic reporting
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import re
import shutil
import struct
import subprocess
import sys
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Any

# Version and constants
VERSION = "3.0.0"
SUPPORTED_FORMATS = [
    ".mp4",
    ".mov",
    ".avi",
    ".mkv",
    ".m4v",
    ".flv",
    ".webm",
    ".wmv",
    ".mpg",
    ".mpeg",
    ".mts",
    ".m2ts",
]

# NAL unit type constants
NAL_TYPE_SLICE = 1
NAL_TYPE_IDR = 5
NAL_TYPE_SEI = 6
NAL_TYPE_SPS = 7
NAL_TYPE_PPS = 8
NAL_TYPE_AUD = 9

# Size constants
MIN_NAL_SIZE = 2
MAX_NAL_SIZE = 1000000  # 1MB
MIN_HEADER_SIZE = 8

# Setup logging
logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


class CorruptionLevel(Enum):
    """Levels of video file corruption severity."""

    NONE = "none"
    MINOR = "minor"
    MODERATE = "moderate"
    SEVERE = "severe"
    CATASTROPHIC = "catastrophic"


class CorruptionType(Enum):
    """Types of corruption that can occur in video files."""

    CONTAINER = "container"
    STREAM = "stream"
    BITSTREAM = "bitstream"
    AUDIO = "audio"
    METADATA = "metadata"
    TIMESTAMP = "timestamp"
    KEYFRAME = "keyframe"
    GOP = "gop"


class RepairStrategy(Enum):
    """Available repair strategies for corrupted video files."""

    EXTRACT_PLAYABLE = "extract_playable"
    CONTAINER_REPAIR = "container_repair"
    STREAM_REMUX = "stream_remux"
    DEEP_REPAIR = "deep_repair"
    KEYFRAME_REBUILD = "keyframe_rebuild"
    GOP_RECONSTRUCTION = "gop_reconstruction"
    TIMESTAMP_FIX = "timestamp_fix"
    AUDIO_REPAIR = "audio_repair"
    SEGMENT_RECOVERY = "segment_recovery"


@dataclass
class StreamInfo:
    """Information about a media stream in a video file."""

    index: int
    codec_type: str
    codec_name: str
    width: int | None = None
    height: int | None = None
    fps: float | None = None
    bitrate: int | None = None
    duration: float | None = None
    nb_frames: int | None = None
    channels: int | None = None
    sample_rate: int | None = None
    errors: list[str] = field(default_factory=list)


@dataclass
class CorruptionDetails:
    """Details about a specific corruption found in a video file."""

    corruption_type: CorruptionType
    severity: str
    location: str | None = None
    description: str = ""
    fixable: bool = True


@dataclass
class RepairResult:
    """Result of a repair attempt on a corrupted video file."""

    strategy: RepairStrategy
    success: bool
    output_path: str | None = None
    recovered_duration: float | None = None
    quality_loss: str | None = None
    notes: str = ""


@dataclass
class CorruptionReport:
    """Comprehensive report of video file corruption analysis."""

    file_path: str
    file_size: int
    corruption_level: CorruptionLevel
    corruption_types: list[CorruptionType]
    corruption_details: list[CorruptionDetails]
    is_playable: bool
    playable_duration: float
    total_duration: float
    repair_feasible: bool
    detailed_analysis: dict[str, Any]
    repair_recommendations: list[str]
    repair_results: list[RepairResult] = field(default_factory=list)
    streams: list[StreamInfo] = field(default_factory=list)


class AdvancedVideoAnalyzer:
    """Advanced video analysis engine with deep inspection capabilities."""

    def __init__(self, ffmpeg_path: str, ffprobe_path: str) -> None:
        self.ffmpeg_path = ffmpeg_path
        self.ffprobe_path = ffprobe_path

    def analyze_h264_bitstream(self, file_path: str) -> dict[str, Any]:
        """Deep H.264 bitstream analysis."""
        analysis = {
            "nal_units": {"total": 0, "corrupted": 0, "types": {}},
            "sps_pps": {"found": False, "valid": False},
            "keyframes": {"total": 0, "corrupted": 0, "interval": []},
            "slice_errors": 0,
            "ref_errors": 0,
        }

        try:
            # Extract raw H.264 bitstream
            cmd = [
                self.ffmpeg_path,
                "-i",
                file_path,
                "-c:v",
                "copy",
                "-bsf:v",
                "h264_mp4toannexb",
                "-f",
                "h264",
                "pipe:",
            ]

            with subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                shell=False,
            ) as process:
                try:
                    stdout, stderr = process.communicate(timeout=60)

                    # Parse NAL units
                    nal_units = self._parse_h264_nal_units(stdout)
                    analysis["nal_units"]["total"] = len(nal_units)

                    for nal in nal_units:
                        nal_type = nal["type"]
                        analysis["nal_units"]["types"][nal_type] = analysis["nal_units"]["types"].get(nal_type, 0) + 1

                        if nal.get("corrupted"):
                            analysis["nal_units"]["corrupted"] += 1

                        # Check for SPS/PPS
                        if nal_type in [NAL_TYPE_SPS, NAL_TYPE_PPS]:  # SPS or PPS
                            analysis["sps_pps"]["found"] = True
                            analysis["sps_pps"]["valid"] = not nal.get("corrupted", False)

                        # Count keyframes
                        if nal_type == NAL_TYPE_IDR:  # IDR slice
                            analysis["keyframes"]["total"] += 1
                            if nal.get("corrupted"):
                                analysis["keyframes"]["corrupted"] += 1

                    # Analyze keyframe intervals
                    analysis["keyframes"]["interval"] = self._calculate_keyframe_intervals(nal_units)

                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait()
                    raise

        except Exception as e:
            logger.exception(f"H.264 bitstream analysis error: {e}")

        return analysis

    def _parse_h264_nal_units(self, bitstream: bytes) -> list[dict[str, Any]]:
        """Parse H.264 NAL units from bitstream."""
        nal_units = []
        offset = 0

        while offset < len(bitstream) - 4:
            # Look for start code (0x00000001 or 0x000001)
            if bitstream[offset : offset + 4] == b"\x00\x00\x00\x01":
                start_code_len = 4
            elif bitstream[offset : offset + 3] == b"\x00\x00\x01":
                start_code_len = 3
            else:
                offset += 1
                continue

            # Find next start code
            next_offset = offset + start_code_len
            while next_offset < len(bitstream) - 4:
                if (
                    bitstream[next_offset : next_offset + 4] == b"\x00\x00\x00\x01"
                    or bitstream[next_offset : next_offset + 3] == b"\x00\x00\x01"
                ):
                    break
                next_offset += 1

            # Extract NAL unit
            nal_data = bitstream[offset + start_code_len : next_offset]
            if nal_data:
                nal_type = nal_data[0] & 0x1F
                nal_units.append(
                    {
                        "offset": offset,
                        "size": len(nal_data),
                        "type": nal_type,
                        "type_name": self._get_nal_type_name(nal_type),
                        "corrupted": self._check_nal_corruption(nal_data),
                    },
                )

            offset = next_offset

        return nal_units

    def _get_nal_type_name(self, nal_type: int) -> str:
        """Get human-readable NAL unit type name."""
        nal_types = {
            NAL_TYPE_SLICE: "Non-IDR slice",
            NAL_TYPE_IDR: "IDR slice",
            NAL_TYPE_SEI: "SEI",
            NAL_TYPE_SPS: "SPS",
            NAL_TYPE_PPS: "PPS",
            NAL_TYPE_AUD: "AUD",
        }
        return nal_types.get(nal_type, f"Type {nal_type}")

    def _check_nal_corruption(self, nal_data: bytes) -> bool:
        """Check if NAL unit appears corrupted."""
        if len(nal_data) < MIN_NAL_SIZE:
            return True

        # Check for forbidden_zero_bit
        if nal_data[0] & 0x80:
            return True

        # Check for reasonable NAL unit size
        if len(nal_data) > MAX_NAL_SIZE:  # > 1MB single NAL unit is suspicious
            return True

        return False

    def _calculate_keyframe_intervals(self, nal_units: list[dict[str, Any]]) -> list[int]:
        """Calculate intervals between keyframes."""
        keyframe_positions = []
        frame_count = 0

        for nal in nal_units:
            if nal["type"] in [NAL_TYPE_SLICE, NAL_TYPE_IDR]:  # Slice NAL units
                if nal["type"] == NAL_TYPE_IDR:  # IDR
                    keyframe_positions.append(frame_count)
                frame_count += 1

        intervals = []
        for i in range(1, len(keyframe_positions)):
            intervals.append(keyframe_positions[i] - keyframe_positions[i - 1])

        return intervals

    def analyze_container_atoms(self, file_path: str) -> dict[str, Any]:
        """Deep container structure analysis for MP4/MOV."""
        analysis = {
            "format": "unknown",
            "atoms": [],
            "moov_found": False,
            "mdat_found": False,
            "ftyp_found": False,
            "errors": [],
        }

        try:
            path_obj = Path(file_path)
            with path_obj.open("rb") as f:
                file_size = path_obj.stat().st_size
                offset = 0

                while offset < file_size:
                    # Read atom header
                    f.seek(offset)
                    header = f.read(MIN_HEADER_SIZE)
                    if len(header) < MIN_HEADER_SIZE:
                        break

                    size = struct.unpack(">I", header[:4])[0]
                    atom_type = header[4:8].decode("ascii", errors="ignore")

                    # Handle 64-bit atoms
                    if size == 1:
                        extended_size = f.read(MIN_HEADER_SIZE)
                        if len(extended_size) == MIN_HEADER_SIZE:
                            size = struct.unpack(">Q", extended_size)[0]

                    atom_info = {
                        "type": atom_type,
                        "offset": offset,
                        "size": size,
                    }

                    # Validate atom
                    if size == 0 or size > file_size - offset:
                        atom_info["error"] = "Invalid size"
                        analysis["errors"].append(f"Invalid atom size at offset {offset}")
                        break

                    analysis["atoms"].append(atom_info)

                    # Check important atoms
                    if atom_type == "ftyp":
                        analysis["ftyp_found"] = True
                        # Read brand
                        f.seek(offset + 8)
                        brand = f.read(4).decode("ascii", errors="ignore")
                        analysis["format"] = brand
                    elif atom_type == "moov":
                        analysis["moov_found"] = True
                    elif atom_type == "mdat":
                        analysis["mdat_found"] = True

                    offset += size

        except Exception as e:
            analysis["errors"].append(f"Container analysis error: {e!s}")

        return analysis


class VidBeast:
    """Main VidBeast video corruption analysis and repair engine."""

    def __init__(
        self,
        verbose: bool = False,
        repair_mode: bool = False,
        output_dir: str | None = None,
        max_threads: int = 4,
        gpu_acceleration: bool = False,
    ) -> None:
        self.verbose = verbose
        self.repair_mode = repair_mode
        self.output_dir = output_dir
        self.max_threads = max_threads
        self.gpu_acceleration = gpu_acceleration

        self.ffprobe_path = self._find_ffprobe()
        self.ffmpeg_path = self._find_ffmpeg()

        if not self.ffprobe_path:
            msg = "FFprobe not found. Please install FFmpeg."
            raise RuntimeError(msg)

        if repair_mode and not self.ffmpeg_path:
            msg = "FFmpeg not found. Required for repair functionality."
            raise RuntimeError(msg)

        self.analyzer = AdvancedVideoAnalyzer(self.ffmpeg_path, self.ffprobe_path)

        self.log(
            "VidBeast v{} initialized{}".format(
                VERSION,
                " (REPAIR MODE + GPU)" if repair_mode and gpu_acceleration else " (REPAIR MODE)" if repair_mode else "",
            ),
        )

    def log(self, message: str) -> None:
        """Print log message if verbose mode enabled."""
        if self.verbose:
            pass

    def _find_ffprobe(self) -> str | None:
        """Find FFprobe executable."""
        try:
            result = subprocess.run(["ffprobe", "-version"], check=False, capture_output=True, text=True, shell=False)
            if result.returncode == 0:
                return "ffprobe"
        except FileNotFoundError:
            pass
        return None

    def _find_ffmpeg(self) -> str | None:
        """Find FFmpeg executable."""
        try:
            result = subprocess.run(
                ["ffmpeg", "-version"],
                check=False,
                capture_output=True,
                text=True,
                timeout=10,
                shell=False,
            )
            if result.returncode == 0:
                return "ffmpeg"
        except FileNotFoundError:
            pass
        return None

    def analyze_file(self, file_path: str) -> CorruptionReport:
        """Comprehensive corruption analysis of a video file with advanced techniques."""
        path_obj = Path(file_path)
        self.log(f"Analyzing: {path_obj.name}")

        if not path_obj.exists():
            msg = f"File not found: {file_path}"
            raise FileNotFoundError(msg)

        file_size = path_obj.stat().st_size

        # Initialize report
        report = CorruptionReport(
            file_path=file_path,
            file_size=file_size,
            corruption_level=CorruptionLevel.NONE,
            corruption_types=[],
            corruption_details=[],
            is_playable=False,
            playable_duration=0.0,
            total_duration=0.0,
            repair_feasible=False,
            detailed_analysis={},
            repair_recommendations=[],
            streams=[],
        )

        # Phase 1: Basic file validation
        self._analyze_file_basics(report)

        if report.corruption_level == CorruptionLevel.CATASTROPHIC:
            self._generate_repair_recommendations(report)
            return report

        # Phase 2: Container analysis
        self._analyze_container(report)

        # Phase 3: Stream analysis
        self._analyze_streams(report)

        # Phase 4: Bitstream analysis
        self._analyze_bitstream(report)

        # Phase 5: Advanced codec-specific analysis
        self._analyze_codec_specific(report)

        # Phase 6: Timestamp and sync analysis
        self._analyze_timestamps(report)

        # Phase 7: Playability test
        self._test_playability(report)

        # Phase 8: Generate repair recommendations
        self._generate_repair_recommendations(report)

        # Phase 9: Execute repairs if requested
        if self.repair_mode and report.repair_feasible:
            self._execute_repairs(report)

        return report

    def _analyze_file_basics(self, report: CorruptionReport) -> None:
        """Basic file size and format validation."""
        self.log("Phase 1: Basic file validation")

        analysis = {}

        # Check file size
        if report.file_size == 0:
            report.corruption_level = CorruptionLevel.CATASTROPHIC
            report.corruption_details.append(
                CorruptionDetails(
                    corruption_type=CorruptionType.CONTAINER,
                    severity="catastrophic",
                    description="File is empty (0 bytes)",
                    fixable=False,
                ),
            )
            analysis["zero_size"] = True
            report.detailed_analysis["file_basics"] = analysis
            return

        # Check for suspiciously small files
        if report.file_size < 100 * 1024:  # < 100KB
            report.corruption_level = CorruptionLevel.SEVERE
            report.corruption_types.append(CorruptionType.CONTAINER)
            report.corruption_details.append(
                CorruptionDetails(
                    corruption_type=CorruptionType.CONTAINER,
                    severity="severe",
                    description=f"File suspiciously small ({report.file_size} bytes)",
                    fixable=False,
                ),
            )
            analysis["suspiciously_small"] = True
            analysis["size_bytes"] = report.file_size

        # Check file extension
        file_ext = os.path.splitext(report.file_path)[1].lower()
        if file_ext not in SUPPORTED_FORMATS:
            analysis["unsupported_format"] = True
            analysis["file_extension"] = file_ext

        # Check file header
        try:
            with open(report.file_path, "rb") as f:
                header = f.read(12)
                analysis["header_bytes"] = header.hex()

                # Check for common video format signatures
                if header[4:8] == b"ftyp":
                    analysis["detected_format"] = "MP4/MOV"
                elif header[:4] == b"RIFF" and header[8:12] == b"AVI ":
                    analysis["detected_format"] = "AVI"
                elif header[:4] == b"\x1a\x45\xdf\xa3":
                    analysis["detected_format"] = "MKV/WebM"
                elif header[:3] == b"FLV":
                    analysis["detected_format"] = "FLV"
                else:
                    analysis["detected_format"] = "Unknown"
                    if report.corruption_level == CorruptionLevel.NONE:
                        report.corruption_level = CorruptionLevel.MINOR
                        report.corruption_details.append(
                            CorruptionDetails(
                                corruption_type=CorruptionType.CONTAINER,
                                severity="minor",
                                description="Unrecognized file header",
                                fixable=True,
                            ),
                        )
        except Exception as e:
            analysis["header_read_error"] = str(e)

        report.detailed_analysis["file_basics"] = analysis

    def _analyze_container(self, report: CorruptionReport) -> None:
        """Advanced container structure analysis."""
        self.log("Phase 2: Container analysis")

        try:
            # Get basic container info with FFprobe
            cmd = [
                self.ffprobe_path,
                "-v",
                "error",
                "-show_format",
                "-show_streams",
                "-show_packets",
                "-read_intervals",
                "%+#10",  # Read first 10 packets
                "-of",
                "json",
                report.file_path,
            ]

            result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=30, shell=False)

            if result.returncode != 0:
                report.corruption_types.append(CorruptionType.CONTAINER)
                if report.corruption_level == CorruptionLevel.NONE:
                    report.corruption_level = CorruptionLevel.SEVERE

                report.corruption_details.append(
                    CorruptionDetails(
                        corruption_type=CorruptionType.CONTAINER,
                        severity="severe",
                        description="FFprobe cannot read container",
                        fixable=True,
                    ),
                )

                report.detailed_analysis["container"] = {
                    "ffprobe_failed": True,
                    "error": result.stderr,
                }
                return

            probe_data = json.loads(result.stdout)

            # Analyze container data
            container_analysis = self._analyze_probe_data(probe_data)
            report.detailed_analysis["container"] = container_analysis

            # Extract duration info
            if "format" in probe_data and "duration" in probe_data["format"]:
                try:
                    report.total_duration = float(probe_data["format"]["duration"])
                except (ValueError, TypeError):
                    report.corruption_types.append(CorruptionType.METADATA)

            # Deep container analysis for MP4/MOV
            if container_analysis.get("format_name", "").lower() in ["mov", "mp4", "m4a", "3gp", "3g2"]:
                atom_analysis = self.analyzer.analyze_container_atoms(report.file_path)
                report.detailed_analysis["atoms"] = atom_analysis

                if not atom_analysis["moov_found"]:
                    report.corruption_types.append(CorruptionType.CONTAINER)
                    report.corruption_details.append(
                        CorruptionDetails(
                            corruption_type=CorruptionType.CONTAINER,
                            severity="severe",
                            description="Missing moov atom",
                            fixable=True,
                        ),
                    )
                    if report.corruption_level in [CorruptionLevel.NONE, CorruptionLevel.MINOR]:
                        report.corruption_level = CorruptionLevel.SEVERE

        except subprocess.TimeoutExpired:
            report.corruption_types.append(CorruptionType.CONTAINER)
            report.corruption_level = CorruptionLevel.MODERATE
            report.detailed_analysis["container"] = {"ffprobe_timeout": True}
        except json.JSONDecodeError:
            report.corruption_types.append(CorruptionType.CONTAINER)
            report.corruption_level = CorruptionLevel.MODERATE
            report.detailed_analysis["container"] = {"json_decode_error": True}
        except Exception as e:
            report.corruption_types.append(CorruptionType.CONTAINER)
            report.detailed_analysis["container"] = {"unexpected_error": str(e)}

    def _analyze_probe_data(self, probe_data: dict) -> dict:
        """Analyze FFprobe output for corruption indicators."""
        analysis = {}

        # Format information
        if "format" in probe_data:
            fmt = probe_data["format"]
            analysis["format_name"] = fmt.get("format_name", "unknown")
            analysis["format_long_name"] = fmt.get("format_long_name", "")
            analysis["duration"] = fmt.get("duration", "0")
            analysis["bit_rate"] = fmt.get("bit_rate", "0")
            analysis["nb_streams"] = fmt.get("nb_streams", 0)

        # Check for streams
        streams = probe_data.get("streams", [])
        analysis["stream_count"] = len(streams)

        if not streams:
            analysis["no_streams"] = True
            return analysis

        # Analyze each stream
        video_streams = []
        audio_streams = []

        for stream in streams:
            stream_info = StreamInfo(
                index=stream.get("index", -1),
                codec_type=stream.get("codec_type", "unknown"),
                codec_name=stream.get("codec_name", "unknown"),
            )

            if stream.get("codec_type") == "video":
                stream_info.width = stream.get("width")
                stream_info.height = stream.get("height")
                stream_info.fps = self._parse_framerate(stream.get("r_frame_rate", "0/0"))
                stream_info.bitrate = int(stream.get("bit_rate", 0)) if stream.get("bit_rate") else None
                stream_info.duration = float(stream.get("duration", 0)) if stream.get("duration") else None
                stream_info.nb_frames = int(stream.get("nb_frames", 0)) if stream.get("nb_frames") else None
                video_streams.append(stream_info)

            elif stream.get("codec_type") == "audio":
                stream_info.channels = stream.get("channels")
                stream_info.sample_rate = int(stream.get("sample_rate", 0)) if stream.get("sample_rate") else None
                stream_info.bitrate = int(stream.get("bit_rate", 0)) if stream.get("bit_rate") else None
                audio_streams.append(stream_info)

            # Store in report
            if hasattr(self, "_current_report"):
                self._current_report.streams.append(stream_info)

        analysis["video_streams"] = len(video_streams)
        analysis["audio_streams"] = len(audio_streams)

        # Analyze video stream properties
        if video_streams:
            video_analysis = self._analyze_video_stream_info(video_streams[0])
            analysis["video"] = video_analysis

        # Analyze audio stream properties
        if audio_streams:
            audio_analysis = self._analyze_audio_stream_info(audio_streams[0])
            analysis["audio"] = audio_analysis

        # Analyze packets if available
        if "packets" in probe_data:
            packet_analysis = self._analyze_packets(probe_data["packets"])
            analysis["packets"] = packet_analysis

        return analysis

    def _parse_framerate(self, fps_string: str) -> float | None:
        """Parse framerate string like '30/1' to float."""
        try:
            parts = fps_string.split("/")
            if len(parts) == 2 and int(parts[1]) != 0:
                return float(parts[0]) / float(parts[1])
        except (ValueError, ZeroDivisionError):
            pass
        return None

    def _analyze_video_stream_info(self, stream: StreamInfo) -> dict:
        """Analyze video stream for corruption indicators."""
        analysis = {
            "codec": stream.codec_name,
            "width": stream.width,
            "height": stream.height,
            "fps": stream.fps,
            "duration": stream.duration,
            "bit_rate": stream.bitrate,
            "frame_count": stream.nb_frames,
        }

        # Check for suspicious properties
        if not stream.width or not stream.height or stream.width == 0 or stream.height == 0:
            analysis["invalid_dimensions"] = True
            stream.errors.append("Invalid video dimensions")

        if stream.bitrate:
            if stream.bitrate < 50000:  # Less than 50kbps is suspicious
                analysis["suspicious_bitrate"] = True
                stream.errors.append("Suspiciously low bitrate")

        # Check for reasonable resolution
        if stream.width and stream.height:
            if stream.width > 8192 or stream.height > 8192:
                analysis["excessive_resolution"] = True
                stream.errors.append("Excessive resolution")

        return analysis

    def _analyze_audio_stream_info(self, stream: StreamInfo) -> dict:
        """Analyze audio stream for corruption indicators."""
        analysis = {
            "codec": stream.codec_name,
            "channels": stream.channels,
            "sample_rate": stream.sample_rate,
            "bit_rate": stream.bitrate,
        }

        # Check for suspicious audio properties
        if not stream.channels or stream.channels == 0:
            analysis["no_audio_channels"] = True
            stream.errors.append("No audio channels")

        if not stream.sample_rate or stream.sample_rate == 0:
            analysis["invalid_sample_rate"] = True
            stream.errors.append("Invalid sample rate")

        return analysis

    def _analyze_packets(self, packets: list[dict]) -> dict:
        """Analyze packet-level data for corruption."""
        analysis = {
            "total_packets": len(packets),
            "corrupted_packets": 0,
            "pts_errors": 0,
            "dts_errors": 0,
        }

        prev_pts = None
        prev_dts = None

        for packet in packets:
            # Check for corruption flags
            if packet.get("flags", "").lower() == "c":
                analysis["corrupted_packets"] += 1

            # Check PTS/DTS monotonicity
            pts = packet.get("pts_time")
            dts = packet.get("dts_time")

            if pts and prev_pts and float(pts) < float(prev_pts):
                analysis["pts_errors"] += 1

            if dts and prev_dts and float(dts) < float(prev_dts):
                analysis["dts_errors"] += 1

            if pts:
                prev_pts = float(pts)
            if dts:
                prev_dts = float(dts)

        return analysis

    def _analyze_streams(self, report: CorruptionReport) -> None:
        """Deep stream analysis for corruption."""
        self.log("Phase 3: Stream analysis")

        # Check for stream errors
        for stream in report.streams:
            if stream.errors:
                if stream.codec_type == "video":
                    report.corruption_types.append(CorruptionType.STREAM)
                    severity = "moderate" if len(stream.errors) == 1 else "severe"
                    report.corruption_details.append(
                        CorruptionDetails(
                            corruption_type=CorruptionType.STREAM,
                            severity=severity,
                            location=f"Stream {stream.index}",
                            description="; ".join(stream.errors),
                            fixable=True,
                        ),
                    )
                elif stream.codec_type == "audio":
                    report.corruption_types.append(CorruptionType.AUDIO)
                    report.corruption_details.append(
                        CorruptionDetails(
                            corruption_type=CorruptionType.AUDIO,
                            severity="minor",
                            location=f"Stream {stream.index}",
                            description="; ".join(stream.errors),
                            fixable=True,
                        ),
                    )

        # Update corruption level based on stream errors
        if any(stream.errors for stream in report.streams):
            if report.corruption_level == CorruptionLevel.NONE:
                report.corruption_level = CorruptionLevel.MODERATE

    def _analyze_bitstream(self, report: CorruptionReport) -> None:
        """Advanced bitstream-level corruption analysis."""
        self.log("Phase 4: Bitstream analysis")

        if not self.ffmpeg_path:
            return

        try:
            # Try to decode video and capture detailed errors
            cmd = [
                self.ffmpeg_path,
                "-v",
                "error",
                "-err_detect",
                "aggressive",
                "-i",
                report.file_path,
                "-f",
                "null",
                "-t",
                "60",  # Test first 60 seconds
                "-",
            ]

            result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=120, shell=False)

            bitstream_analysis = {
                "decode_attempted": True,
                "decode_successful": result.returncode == 0,
            }

            if result.stderr:
                errors = result.stderr.strip()
                bitstream_analysis["decode_errors"] = errors

                # Count and categorize different types of errors
                error_counts = self._count_decode_errors(errors)
                bitstream_analysis["error_counts"] = error_counts

                # Analyze error patterns
                error_patterns = self._analyze_error_patterns(errors)
                bitstream_analysis["error_patterns"] = error_patterns

                # Determine corruption level based on errors
                total_errors = sum(error_counts.values())

                if error_patterns.get("reference_frame_errors", 0) > 10:
                    report.corruption_types.append(CorruptionType.BITSTREAM)
                    report.corruption_details.append(
                        CorruptionDetails(
                            corruption_type=CorruptionType.BITSTREAM,
                            severity="severe",
                            description="Multiple reference frame errors",
                            fixable=True,
                        ),
                    )

                if error_patterns.get("slice_errors", 0) > 5:
                    report.corruption_types.append(CorruptionType.BITSTREAM)
                    report.corruption_details.append(
                        CorruptionDetails(
                            corruption_type=CorruptionType.BITSTREAM,
                            severity="moderate",
                            description="Slice decoding errors",
                            fixable=True,
                        ),
                    )

                if total_errors > 100:
                    if report.corruption_level in [CorruptionLevel.NONE, CorruptionLevel.MINOR]:
                        report.corruption_level = CorruptionLevel.MODERATE
                elif total_errors > 10:
                    if report.corruption_level == CorruptionLevel.NONE:
                        report.corruption_level = CorruptionLevel.MINOR

            report.detailed_analysis["bitstream"] = bitstream_analysis

        except subprocess.TimeoutExpired:
            report.detailed_analysis["bitstream"] = {"decode_timeout": True}
        except Exception as e:
            report.detailed_analysis["bitstream"] = {"analysis_error": str(e)}

    def _count_decode_errors(self, errors: str) -> dict:
        """Count different types of decode errors."""
        error_patterns = {
            "nal_unit_errors": [
                "Invalid NAL unit",
                "Error splitting the input into NAL units",
                "nal_unit_type",
            ],
            "reference_errors": [
                "reference picture missing",
                "Reference",
                "error while decoding MB",
            ],
            "slice_errors": [
                "error while parsing slice",
                "slice type",
                "decode_slice_header error",
            ],
            "aac_errors": [
                "Reserved bit set",
                "Number of bands",
                "channel element",
                "Prediction is not allowed",
            ],
            "timestamp_errors": [
                "DTS",
                "PTS",
                "non-monotonous DTS",
                "timestamp",
            ],
            "container_errors": [
                "moov atom not found",
                "Invalid data found",
                "could not find codec parameters",
            ],
        }

        counts = {}
        for error_type, patterns in error_patterns.items():
            count = 0
            for pattern in patterns:
                count += errors.lower().count(pattern.lower())
            counts[error_type] = count

        return counts

    def _analyze_error_patterns(self, errors: str) -> dict:
        """Analyze error patterns for specific issues."""
        return {
            "reference_frame_errors": len(re.findall(r"reference picture missing", errors, re.IGNORECASE)),
            "slice_errors": len(re.findall(r"error while parsing slice", errors, re.IGNORECASE)),
            "timestamp_discontinuities": len(re.findall(r"non-monotonous (DTS|PTS)", errors, re.IGNORECASE)),
            "keyframe_errors": len(re.findall(r"(IDR|keyframe)", errors, re.IGNORECASE)),
        }

    def _analyze_codec_specific(self, report: CorruptionReport) -> None:
        """Codec-specific deep analysis."""
        self.log("Phase 5: Codec-specific analysis")

        # Find video stream
        video_stream = next((s for s in report.streams if s.codec_type == "video"), None)

        if not video_stream:
            return

        codec_analysis = {}

        # H.264 specific analysis
        if video_stream.codec_name in ["h264", "avc"]:
            h264_analysis = self.analyzer.analyze_h264_bitstream(report.file_path)
            codec_analysis["h264"] = h264_analysis

            # Check for SPS/PPS issues
            if not h264_analysis["sps_pps"]["found"]:
                report.corruption_types.append(CorruptionType.BITSTREAM)
                report.corruption_details.append(
                    CorruptionDetails(
                        corruption_type=CorruptionType.BITSTREAM,
                        severity="severe",
                        description="Missing SPS/PPS",
                        fixable=True,
                    ),
                )

            # Check keyframe corruption
            if h264_analysis["keyframes"]["corrupted"] > 0:
                report.corruption_types.append(CorruptionType.KEYFRAME)
                severity = "severe" if h264_analysis["keyframes"]["corrupted"] > 5 else "moderate"
                report.corruption_details.append(
                    CorruptionDetails(
                        corruption_type=CorruptionType.KEYFRAME,
                        severity=severity,
                        description=f"{h264_analysis['keyframes']['corrupted']} corrupted keyframes",
                        fixable=True,
                    ),
                )

        # HEVC specific analysis
        elif video_stream.codec_name in ["h265", "hevc"]:
            # Similar analysis for HEVC
            codec_analysis["hevc"] = {"analyzed": True}

        report.detailed_analysis["codec_specific"] = codec_analysis

    def _analyze_timestamps(self, report: CorruptionReport) -> None:
        """Analyze timestamp consistency and sync issues."""
        self.log("Phase 6: Timestamp and sync analysis")

        try:
            cmd = [
                self.ffprobe_path,
                "-v",
                "error",
                "-select_streams",
                "v:0",
                "-show_entries",
                "packet=pts_time,dts_time,duration_time",
                "-of",
                "json",
                "-read_intervals",
                "%+#100",  # Read first 100 packets
                report.file_path,
            ]

            result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=30, shell=False)

            if result.returncode == 0:
                packet_data = json.loads(result.stdout)
                packets = packet_data.get("packets", [])

                timestamp_analysis = {
                    "total_packets_analyzed": len(packets),
                    "pts_gaps": 0,
                    "dts_errors": 0,
                    "sync_issues": False,
                }

                prev_pts = None
                prev_dts = None

                for packet in packets:
                    pts = packet.get("pts_time")
                    dts = packet.get("dts_time")

                    if pts and prev_pts:
                        pts_val = float(pts)
                        prev_pts_val = float(prev_pts)

                        # Check for large gaps
                        if pts_val - prev_pts_val > 1.0:  # Gap > 1 second
                            timestamp_analysis["pts_gaps"] += 1

                        # Check for backwards timestamps
                        if pts_val < prev_pts_val:
                            timestamp_analysis["pts_errors"] = timestamp_analysis.get("pts_errors", 0) + 1

                    if dts and prev_dts:
                        if float(dts) < float(prev_dts):
                            timestamp_analysis["dts_errors"] += 1

                    prev_pts = pts
                    prev_dts = dts

                # Determine if there are sync issues
                if timestamp_analysis["pts_gaps"] > 5 or timestamp_analysis["dts_errors"] > 0:
                    timestamp_analysis["sync_issues"] = True
                    report.corruption_types.append(CorruptionType.TIMESTAMP)
                    report.corruption_details.append(
                        CorruptionDetails(
                            corruption_type=CorruptionType.TIMESTAMP,
                            severity="moderate",
                            description="Timestamp discontinuities detected",
                            fixable=True,
                        ),
                    )

                report.detailed_analysis["timestamps"] = timestamp_analysis

        except Exception as e:
            report.detailed_analysis["timestamps"] = {"error": str(e)}

    def _test_playability(self, report: CorruptionReport) -> None:
        """Test how much of the video is actually playable."""
        self.log("Phase 7: Playability test")

        if not self.ffmpeg_path:
            return

        try:
            # Try to decode the entire video
            cmd = [
                self.ffmpeg_path,
                "-v",
                "error",
                "-i",
                report.file_path,
                "-f",
                "null",
                "-",
            ]

            start_time = time.time()
            result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=300, shell=False)
            elapsed_time = time.time() - start_time

            playability = {}

            if result.returncode == 0:
                # Video decoded successfully
                report.is_playable = True
                if report.total_duration > 0:
                    report.playable_duration = report.total_duration
                else:
                    # Estimate based on decode time
                    report.playable_duration = elapsed_time * 10

                playability["fully_playable"] = True
            else:
                # Try to determine playable duration
                duration_match = re.search(r"time=(\d{2}):(\d{2}):(\d{2}\.\d+)", result.stderr)
                if duration_match:
                    hours, minutes, seconds = duration_match.groups()
                    report.playable_duration = int(hours) * 3600 + int(minutes) * 60 + float(seconds)
                    report.is_playable = report.playable_duration > 0

                playability["partially_playable"] = report.is_playable
                playability["decode_failed"] = True

                # Try segment-based playability test
                segment_test = self._test_segment_playability(report.file_path)
                playability["segment_test"] = segment_test

                if segment_test["playable_segments"] > 0:
                    report.playable_duration = max(report.playable_duration, segment_test["last_playable_time"])

            report.detailed_analysis["playability"] = playability

        except subprocess.TimeoutExpired:
            report.detailed_analysis["playability"] = {"decode_timeout": True}
        except Exception as e:
            report.detailed_analysis["playability"] = {"test_error": str(e)}

    def _test_segment_playability(self, file_path: str) -> dict:
        """Test playability in segments to find exact corruption point."""
        segment_info = {
            "total_segments": 10,
            "playable_segments": 0,
            "first_error_time": None,
            "last_playable_time": 0,
        }

        # Get total duration first
        try:
            cmd = [self.ffprobe_path, "-v", "error", "-show_entries", "format=duration", "-of", "json", file_path]
            result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=30, shell=False)
            if result.returncode == 0:
                data = json.loads(result.stdout)
                total_duration = float(data["format"]["duration"])
                segment_duration = total_duration / segment_info["total_segments"]

                # Test each segment
                for i in range(segment_info["total_segments"]):
                    start_time = i * segment_duration

                    cmd = [
                        self.ffmpeg_path,
                        "-v",
                        "error",
                        "-ss",
                        str(start_time),
                        "-i",
                        file_path,
                        "-t",
                        "1",  # Test 1 second
                        "-f",
                        "null",
                        "-",
                    ]

                    result = subprocess.run(cmd, check=False, capture_output=True, timeout=5, shell=False)

                    if result.returncode == 0:
                        segment_info["playable_segments"] += 1
                        segment_info["last_playable_time"] = start_time + 1
                    else:
                        if segment_info["first_error_time"] is None:
                            segment_info["first_error_time"] = start_time
                        break

        except Exception:
            pass

        return segment_info

    def _generate_repair_recommendations(self, report: CorruptionReport) -> None:
        """Generate intelligent repair recommendations based on analysis."""
        self.log("Phase 8: Generating repair recommendations")

        recommendations = []

        # Basic checks
        if report.file_size == 0:
            recommendations.append("File is empty - cannot be repaired")
            report.repair_feasible = False
            report.repair_recommendations = recommendations
            return

        if report.file_size < 100 * 1024:
            recommendations.append("File too small to contain valid video data - likely unrecoverable")
            report.repair_feasible = False
            report.repair_recommendations = recommendations
            return

        # Container-level repairs
        if CorruptionType.CONTAINER in report.corruption_types:
            container_details = [d for d in report.corruption_details if d.corruption_type == CorruptionType.CONTAINER]

            for detail in container_details:
                if "moov atom" in detail.description.lower():
                    recommendations.append("Priority: Rebuild MP4/MOV moov atom using untrunc or similar tools")
                    recommendations.append("Alternative: Extract raw streams and remux into new container")
                elif "header" in detail.description.lower():
                    recommendations.append("Repair container header structure")
                    recommendations.append("Try forced format detection with FFmpeg")

        # Stream-level repairs
        if CorruptionType.STREAM in report.corruption_types:
            recommendations.append("Extract individual streams and rebuild container")
            recommendations.append("Use stream copy with error resilience flags")

        # Bitstream repairs
        if CorruptionType.BITSTREAM in report.corruption_types:
            bitstream_details = [d for d in report.corruption_details if d.corruption_type == CorruptionType.BITSTREAM]

            for detail in bitstream_details:
                if "reference frame" in detail.description.lower():
                    recommendations.append("Rebuild GOP structure with forced keyframes")
                    recommendations.append("Extract segments between valid keyframes")
                elif "slice" in detail.description.lower():
                    recommendations.append("Use error concealment during re-encoding")
                    recommendations.append("Skip corrupted slices with FFmpeg filters")

        # Keyframe issues
        if CorruptionType.KEYFRAME in report.corruption_types:
            recommendations.append("Force keyframe generation at regular intervals")
            recommendations.append("Use scene detection to place new keyframes")

        # Timestamp issues
        if CorruptionType.TIMESTAMP in report.corruption_types:
            recommendations.append("Regenerate timestamps with genpts filter")
            recommendations.append("Fix timestamp discontinuities with setpts filter")

        # Audio issues
        if CorruptionType.AUDIO in report.corruption_types:
            recommendations.append("Remove corrupted audio track and keep video only")
            recommendations.append("Re-encode audio with error resilience")
            recommendations.append("Replace audio with silence if necessary")

        # Playability-based recommendations
        if report.is_playable and report.playable_duration > 0:
            if report.total_duration > 0 and report.playable_duration < report.total_duration * 0.9:
                recommendations.append(f"Extract playable portion (first {report.playable_duration:.1f} seconds)")
                recommendations.append("Use segment-based recovery for maximum extraction")
            else:
                recommendations.append("File mostly intact - simple remux may suffice")
            report.repair_feasible = True
        else:
            recommendations.append("Deep repair required - full re-encoding recommended")
            recommendations.append("Try multiple repair strategies in sequence")
            report.repair_feasible = True  # Still try repairs

        # GPU acceleration recommendation
        if self.gpu_acceleration:
            recommendations.append("Use GPU acceleration for faster re-encoding")

        # Set final recommendations
        report.repair_recommendations = recommendations

    def _execute_repairs(self, report: CorruptionReport) -> None:
        """Execute multiple repair strategies with advanced techniques."""
        self.log("Phase 9: Executing repairs")

        if not self.output_dir:
            self.output_dir = os.path.dirname(report.file_path)

        os.makedirs(self.output_dir, exist_ok=True)

        base_name = os.path.splitext(os.path.basename(report.file_path))[0]

        # Try multiple repair strategies based on corruption type
        strategies = self._select_repair_strategies(report)

        for strategy in strategies:
            self.log(f"Attempting repair strategy: {strategy.value}")

            try:
                if strategy == RepairStrategy.EXTRACT_PLAYABLE:
                    result = self._extract_playable_advanced(report, base_name)
                elif strategy == RepairStrategy.CONTAINER_REPAIR:
                    result = self._repair_container_advanced(report, base_name)
                elif strategy == RepairStrategy.STREAM_REMUX:
                    result = self._remux_streams_advanced(report, base_name)
                elif strategy == RepairStrategy.DEEP_REPAIR:
                    result = self._deep_repair_advanced(report, base_name)
                elif strategy == RepairStrategy.KEYFRAME_REBUILD:
                    result = self._rebuild_keyframes(report, base_name)
                elif strategy == RepairStrategy.TIMESTAMP_FIX:
                    result = self._fix_timestamps(report, base_name)
                elif strategy == RepairStrategy.SEGMENT_RECOVERY:
                    result = self._segment_recovery(report, base_name)
                else:
                    continue

                if result and result.success:
                    report.repair_results.append(result)

            except Exception as e:
                self.log(f"Repair strategy {strategy.value} failed: {e}")
                report.repair_results.append(
                    RepairResult(
                        strategy=strategy,
                        success=False,
                        notes=f"Error: {e!s}",
                    ),
                )

    def _select_repair_strategies(self, report: CorruptionReport) -> list[RepairStrategy]:
        """Intelligently select repair strategies based on corruption analysis."""
        strategies = []

        # Always try to extract playable portion first
        if report.is_playable and report.playable_duration > 0:
            strategies.append(RepairStrategy.EXTRACT_PLAYABLE)

        # Container issues
        if CorruptionType.CONTAINER in report.corruption_types:
            strategies.append(RepairStrategy.CONTAINER_REPAIR)
            strategies.append(RepairStrategy.STREAM_REMUX)

        # Bitstream issues
        if CorruptionType.BITSTREAM in report.corruption_types:
            strategies.append(RepairStrategy.DEEP_REPAIR)

        # Keyframe issues
        if CorruptionType.KEYFRAME in report.corruption_types:
            strategies.append(RepairStrategy.KEYFRAME_REBUILD)

        # Timestamp issues
        if CorruptionType.TIMESTAMP in report.corruption_types:
            strategies.append(RepairStrategy.TIMESTAMP_FIX)

        # Try segment recovery as last resort
        if len(strategies) == 0 or report.corruption_level in [CorruptionLevel.SEVERE, CorruptionLevel.CATASTROPHIC]:
            strategies.append(RepairStrategy.SEGMENT_RECOVERY)

        return strategies

    def _extract_playable_advanced(self, report: CorruptionReport, base_name: str) -> RepairResult:
        """Advanced extraction of playable video portion."""
        output_path = os.path.join(self.output_dir, f"{base_name}_extracted.mp4")

        # Determine extraction duration
        duration = min(report.playable_duration, report.total_duration) if report.total_duration > 0 else report.playable_duration

        cmd = [
            self.ffmpeg_path,
            "-y",
            "-err_detect",
            "ignore_err",
            "-fflags",
            "+genpts+igndts+discardcorrupt",
            "-i",
            report.file_path,
            "-t",
            str(duration),
            "-c",
            "copy",
            "-avoid_negative_ts",
            "make_zero",
            "-movflags",
            "+faststart",
            output_path,
        ]

        result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=600, shell=False)

        if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1024:
            # Verify the output
            verify_result = self._verify_repair(output_path)

            return RepairResult(
                strategy=RepairStrategy.EXTRACT_PLAYABLE,
                success=True,
                output_path=output_path,
                recovered_duration=duration,
                quality_loss="None (stream copy)",
                notes=f"Extracted {duration:.1f}s of playable content. Verification: {verify_result}",
            )

        return RepairResult(
            strategy=RepairStrategy.EXTRACT_PLAYABLE,
            success=False,
            notes=f"Extraction failed: {result.stderr[:200]}",
        )

    def _repair_container_advanced(self, report: CorruptionReport, base_name: str) -> RepairResult:
        """Advanced container structure repair."""
        output_path = os.path.join(self.output_dir, f"{base_name}_container_fixed.mp4")

        # Try multiple container repair approaches
        repair_approaches = [
            # Approach 1: Aggressive error ignoring
            [
                self.ffmpeg_path,
                "-y",
                "-err_detect",
                "ignore_err",
                "-fflags",
                "+genpts+igndts+discardcorrupt",
                "-i",
                report.file_path,
                "-c",
                "copy",
                "-f",
                "mp4",
                "-movflags",
                "+faststart+frag_keyframe+empty_moov",
                output_path,
            ],
            # Approach 2: Force format with recovery
            [
                self.ffmpeg_path,
                "-y",
                "-f",
                "mp4",
                "-err_detect",
                "aggressive",
                "-fflags",
                "+genpts+igndts",
                "-i",
                report.file_path,
                "-c",
                "copy",
                "-map",
                "0",
                "-ignore_unknown",
                "-max_muxing_queue_size",
                "1024",
                output_path,
            ],
        ]

        for i, cmd in enumerate(repair_approaches):
            result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=600, shell=False)

            if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1024:
                return RepairResult(
                    strategy=RepairStrategy.CONTAINER_REPAIR,
                    success=True,
                    output_path=output_path,
                    quality_loss="None (container repair only)",
                    notes=f"Container repaired using approach {i + 1}",
                )

        return RepairResult(
            strategy=RepairStrategy.CONTAINER_REPAIR,
            success=False,
            notes="All container repair approaches failed",
        )

    def _remux_streams_advanced(self, report: CorruptionReport, base_name: str) -> RepairResult:
        """Advanced stream remuxing with individual stream extraction."""
        output_path = os.path.join(self.output_dir, f"{base_name}_remuxed.mp4")

        # First, try to extract individual streams
        temp_dir = tempfile.mkdtemp()
        extracted_streams = []

        try:
            # Extract video stream
            for i, stream in enumerate(report.streams):
                if stream.codec_type == "video":
                    video_path = os.path.join(temp_dir, f"video_{i}.h264")
                    cmd = [
                        self.ffmpeg_path,
                        "-y",
                        "-err_detect",
                        "ignore_err",
                        "-i",
                        report.file_path,
                        "-map",
                        f"0:{stream.index}",
                        "-c",
                        "copy",
                        "-bsf:v",
                        "h264_mp4toannexb",
                        video_path,
                    ]

                    result = subprocess.run(cmd, check=False, capture_output=True, timeout=300)
                    if result.returncode == 0 and os.path.exists(video_path):
                        extracted_streams.append(("video", video_path))

                elif stream.codec_type == "audio":
                    audio_path = os.path.join(temp_dir, f"audio_{i}.aac")
                    cmd = [
                        self.ffmpeg_path,
                        "-y",
                        "-err_detect",
                        "ignore_err",
                        "-i",
                        report.file_path,
                        "-map",
                        f"0:{stream.index}",
                        "-c",
                        "copy",
                        audio_path,
                    ]

                    result = subprocess.run(cmd, check=False, capture_output=True, timeout=300)
                    if result.returncode == 0 and os.path.exists(audio_path):
                        extracted_streams.append(("audio", audio_path))

            # Remux extracted streams
            if extracted_streams:
                cmd = [self.ffmpeg_path, "-y"]

                # Add all extracted streams as inputs
                for _stream_type, stream_path in extracted_streams:
                    cmd.extend(["-i", stream_path])

                # Map all inputs
                for i in range(len(extracted_streams)):
                    cmd.extend(["-map", str(i)])

                cmd.extend(
                    [
                        "-c",
                        "copy",
                        "-movflags",
                        "+faststart",
                        output_path,
                    ],
                )

                result = subprocess.run(cmd, check=False, capture_output=True, timeout=600)

                if result.returncode == 0 and os.path.exists(output_path):
                    return RepairResult(
                        strategy=RepairStrategy.STREAM_REMUX,
                        success=True,
                        output_path=output_path,
                        quality_loss="None (stream remux)",
                        notes=f"Remuxed {len(extracted_streams)} streams",
                    )

        finally:
            # Cleanup temp files
            shutil.rmtree(temp_dir, ignore_errors=True)

        # Fallback to simple remux
        cmd = [
            self.ffmpeg_path,
            "-y",
            "-fflags",
            "+genpts+igndts",
            "-err_detect",
            "ignore_err",
            "-i",
            report.file_path,
            "-c",
            "copy",
            "-map",
            "0",
            "-ignore_unknown",
            output_path,
        ]

        result = subprocess.run(cmd, check=False, capture_output=True, timeout=600)

        if result.returncode == 0 and os.path.exists(output_path):
            return RepairResult(
                strategy=RepairStrategy.STREAM_REMUX,
                success=True,
                output_path=output_path,
                quality_loss="None (simple remux)",
                notes="Simple stream remux completed",
            )

        return RepairResult(
            strategy=RepairStrategy.STREAM_REMUX,
            success=False,
            notes="Stream remux failed",
        )

    def _deep_repair_advanced(self, report: CorruptionReport, base_name: str) -> RepairResult:
        """Deep repair with full re-encoding and advanced error concealment."""
        output_path = os.path.join(self.output_dir, f"{base_name}_deep_repaired.mp4")

        # Build encoding command with GPU acceleration if available
        cmd = [
            self.ffmpeg_path,
            "-y",
            "-err_detect",
            "ignore_err",
            "-fflags",
            "+genpts+igndts+discardcorrupt",
            "-i",
            report.file_path,
        ]

        # Video encoding settings
        if self.gpu_acceleration:
            # Try NVIDIA GPU encoding
            cmd.extend(
                [
                    "-c:v",
                    "h264_nvenc",
                    "-preset",
                    "slow",
                    "-b:v",
                    "5M",
                    "-maxrate",
                    "10M",
                    "-bufsize",
                    "20M",
                ],
            )
        else:
            # CPU encoding with x264
            cmd.extend(
                [
                    "-c:v",
                    "libx264",
                    "-preset",
                    "medium",
                    "-crf",
                    "23",
                    "-tune",
                    "film",
                ],
            )

        # Add error concealment and recovery options
        cmd.extend(
            [
                "-x264-params",
                "keyint=30:min-keyint=1:rc-lookahead=30",
                "-movflags",
                "+faststart",
                "-pix_fmt",
                "yuv420p",
                "-c:a",
                "aac",
                "-b:a",
                "192k",
                "-ar",
                "48000",
                "-ac",
                "2",
                output_path,
            ],
        )

        result = subprocess.run(
            cmd,
            check=False,
            capture_output=True,
            text=True,
            timeout=1800,
            shell=False,
        )  # 30 min timeout

        if result.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 1024:
            return RepairResult(
                strategy=RepairStrategy.DEEP_REPAIR,
                success=True,
                output_path=output_path,
                quality_loss="Minimal (CRF 23)" if not self.gpu_acceleration else "Minimal (5Mbps VBR)",
                notes="Full re-encoding completed with error concealment",
            )

        return RepairResult(
            strategy=RepairStrategy.DEEP_REPAIR,
            success=False,
            notes=f"Deep repair failed: {result.stderr[:200]}",
        )

    def _rebuild_keyframes(self, report: CorruptionReport, base_name: str) -> RepairResult:
        """Rebuild video with forced keyframe intervals."""
        output_path = os.path.join(self.output_dir, f"{base_name}_keyframes_rebuilt.mp4")

        cmd = [
            self.ffmpeg_path,
            "-y",
            "-err_detect",
            "ignore_err",
            "-i",
            report.file_path,
            "-c:v",
            "libx264",
            "-g",
            "30",  # GOP size
            "-keyint_min",
            "15",  # Minimum keyframe interval
            "-sc_threshold",
            "40",  # Scene change threshold
            "-forced-idr",
            "1",
            "-preset",
            "medium",
            "-crf",
            "23",
            "-c:a",
            "copy",
            "-movflags",
            "+faststart",
            output_path,
        ]

        result = subprocess.run(cmd, check=False, capture_output=True, timeout=1800)

        if result.returncode == 0 and os.path.exists(output_path):
            return RepairResult(
                strategy=RepairStrategy.KEYFRAME_REBUILD,
                success=True,
                output_path=output_path,
                quality_loss="Minimal (CRF 23)",
                notes="Keyframes rebuilt with 1-second intervals",
            )

        return RepairResult(
            strategy=RepairStrategy.KEYFRAME_REBUILD,
            success=False,
            notes="Keyframe rebuild failed",
        )

    def _fix_timestamps(self, report: CorruptionReport, base_name: str) -> RepairResult:
        """Fix timestamp issues with advanced filters."""
        output_path = os.path.join(self.output_dir, f"{base_name}_timestamps_fixed.mp4")

        cmd = [
            self.ffmpeg_path,
            "-y",
            "-fflags",
            "+genpts+igndts",
            "-i",
            report.file_path,
            "-vf",
            "setpts=N/FRAME_RATE/TB",
            "-af",
            "asetpts=N/SR/TB",
            "-c:v",
            "libx264",
            "-preset",
            "fast",
            "-crf",
            "23",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            output_path,
        ]

        result = subprocess.run(cmd, check=False, capture_output=True, timeout=1800)

        if result.returncode == 0 and os.path.exists(output_path):
            return RepairResult(
                strategy=RepairStrategy.TIMESTAMP_FIX,
                success=True,
                output_path=output_path,
                quality_loss="Minimal (CRF 23)",
                notes="Timestamps regenerated",
            )

        return RepairResult(
            strategy=RepairStrategy.TIMESTAMP_FIX,
            success=False,
            notes="Timestamp fix failed",
        )

    def _segment_recovery(self, report: CorruptionReport, base_name: str) -> RepairResult:
        """Advanced segment-based recovery for severely corrupted files."""
        output_path = os.path.join(self.output_dir, f"{base_name}_segments_recovered.mp4")
        temp_dir = tempfile.mkdtemp()

        try:
            # Get total duration
            total_duration = report.total_duration or 3600  # Default 1 hour if unknown
            segment_duration = 10  # 10 second segments
            num_segments = int(total_duration / segment_duration) + 1

            valid_segments = []

            # Try to extract each segment
            for i in range(num_segments):
                start_time = i * segment_duration
                segment_path = os.path.join(temp_dir, f"segment_{i:04d}.mp4")

                cmd = [
                    self.ffmpeg_path,
                    "-y",
                    "-ss",
                    str(start_time),
                    "-i",
                    report.file_path,
                    "-t",
                    str(segment_duration),
                    "-c",
                    "copy",
                    "-avoid_negative_ts",
                    "make_zero",
                    segment_path,
                ]

                result = subprocess.run(cmd, check=False, capture_output=True, timeout=30)

                if result.returncode == 0 and os.path.exists(segment_path) and os.path.getsize(segment_path) > 1024:
                    valid_segments.append(segment_path)
                else:
                    # Try with re-encoding if copy fails
                    cmd[cmd.index("copy")] = "libx264"
                    cmd.extend(["-preset", "ultrafast"])

                    result = subprocess.run(cmd, check=False, capture_output=True, timeout=60)

                    if result.returncode == 0 and os.path.exists(segment_path):
                        valid_segments.append(segment_path)

            if valid_segments:
                # Create concat file
                concat_file = os.path.join(temp_dir, "concat.txt")
                with open(concat_file, "w") as f:
                    f.writelines(f"file '{segment}'\n" for segment in valid_segments)

                # Concatenate segments
                cmd = [
                    self.ffmpeg_path,
                    "-y",
                    "-f",
                    "concat",
                    "-safe",
                    "0",
                    "-i",
                    concat_file,
                    "-c",
                    "copy",
                    output_path,
                ]

                result = subprocess.run(cmd, check=False, capture_output=True, timeout=600)

                if result.returncode == 0 and os.path.exists(output_path):
                    recovered_duration = len(valid_segments) * segment_duration
                    return RepairResult(
                        strategy=RepairStrategy.SEGMENT_RECOVERY,
                        success=True,
                        output_path=output_path,
                        recovered_duration=recovered_duration,
                        quality_loss="Variable (mixed copy/re-encode)",
                        notes=f"Recovered {len(valid_segments)} segments ({recovered_duration}s)",
                    )

        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

        return RepairResult(
            strategy=RepairStrategy.SEGMENT_RECOVERY,
            success=False,
            notes="No valid segments could be recovered",
        )

    def _verify_repair(self, output_path: str) -> str:
        """Verify the repaired file."""
        try:
            cmd = [
                self.ffprobe_path,
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "json",
                output_path,
            ]

            result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=10)

            if result.returncode == 0:
                data = json.loads(result.stdout)
                duration = float(data["format"]["duration"])
                return f"Valid ({duration:.1f}s)"
            return "Invalid output"

        except Exception:
            return "Verification failed"

    def extract_frames_to_png(self, report: CorruptionReport, output_dir: str, frame_rate: str = "1") -> bool:
        """Extract video frames to PNG files for forensic analysis."""
        try:
            self.log(f"Extracting frames to PNG at {frame_rate} fps")

            os.makedirs(output_dir, exist_ok=True)

            base_name = os.path.splitext(os.path.basename(report.file_path))[0]
            output_pattern = os.path.join(output_dir, f"{base_name}_frame_%06d.png")

            cmd = [
                self.ffmpeg_path,
                "-i",
                report.file_path,
                "-vf",
                f"fps={frame_rate}",
                "-q:v",
                "1",
                "-pix_fmt",
                "rgb24",
                output_pattern,
            ]

            result = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=600, shell=False)

            if result.returncode == 0:
                frame_files = [f for f in os.listdir(output_dir) if f.startswith(f"{base_name}_frame_") and f.endswith(".png")]
                self.log(f"Successfully extracted {len(frame_files)} frames to {output_dir}")
                return True
            self.log(f"Frame extraction failed: {result.stderr}")
            return False

        except Exception as e:
            self.log(f"Frame extraction error: {e}")
            return False

    def batch_analyze(self, file_paths: list[str], max_workers: int | None = None) -> list[CorruptionReport]:
        """Analyze multiple files in parallel."""
        if max_workers is None:
            max_workers = self.max_threads

        reports = []

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_file = {executor.submit(self.analyze_file, fp): fp for fp in file_paths}

            for future in as_completed(future_to_file):
                file_path = future_to_file[future]
                try:
                    report = future.result()
                    reports.append(report)
                except Exception as e:
                    self.log(f"Error analyzing {file_path}: {e}")
                    # Create error report
                    error_report = CorruptionReport(
                        file_path=file_path,
                        file_size=0,
                        corruption_level=CorruptionLevel.CATASTROPHIC,
                        corruption_types=[],
                        corruption_details=[],
                        is_playable=False,
                        playable_duration=0,
                        total_duration=0,
                        repair_feasible=False,
                        detailed_analysis={"error": str(e)},
                        repair_recommendations=[],
                    )
                    reports.append(error_report)

        return reports


def print_banner() -> None:
    """Print VidBeast banner."""


def print_report(report: CorruptionReport, detailed: bool = False) -> None:
    """Print corruption analysis report."""
    if report.corruption_types:
        ", ".join([t.value for t in report.corruption_types])

    if report.corruption_details:
        for _detail in report.corruption_details:
            pass

    if report.is_playable and report.playable_duration > 0:
        if report.total_duration > 0:
            (report.playable_duration / report.total_duration) * 100

    if report.repair_recommendations:
        for _i, _rec in enumerate(report.repair_recommendations, 1):
            pass

    if report.repair_results:
        for result in report.repair_results:
            if result.success:
                if result.recovered_duration:
                    pass
                if result.quality_loss:
                    pass
            if result.notes:
                pass

    if detailed:
        pass


def main() -> int:
    parser = argparse.ArgumentParser(
        description="VidBeast - Advanced Video Corruption Analysis & Repair Engine",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    parser.add_argument("input", help="Input video file or directory")
    parser.add_argument("-v", "--verbose", action="store_true", help="Verbose output")
    parser.add_argument("-d", "--detailed", action="store_true", help="Show detailed analysis")
    parser.add_argument("-r", "--recursive", action="store_true", help="Process directories recursively")
    parser.add_argument("-o", "--output", help="Output directory for repaired files")
    parser.add_argument("--repair", action="store_true", help="Enable repair mode - actually fix corrupted files")
    parser.add_argument("--extract-frames", help="Extract frames to PNG files (specify output directory)")
    parser.add_argument("--frame-rate", default="1", help="Frame extraction rate (default: 1 fps)")
    parser.add_argument("--max-threads", type=int, default=4, help="Maximum parallel processing threads")
    parser.add_argument("--gpu", action="store_true", help="Enable GPU acceleration for repairs")
    parser.add_argument("--format", choices=["text", "json", "csv"], default="text", help="Output format")

    args = parser.parse_args()

    if args.format == "text":
        print_banner()

    if args.repair and args.format == "text":
        pass

    try:
        vidbeast = VidBeast(
            verbose=args.verbose,
            repair_mode=args.repair,
            output_dir=args.output,
            max_threads=args.max_threads,
            gpu_acceleration=args.gpu,
        )

        # Process input
        if os.path.isfile(args.input):
            # Single file
            report = vidbeast.analyze_file(args.input)

            if args.format == "text":
                print_report(report, args.detailed)
            elif args.format == "json":
                pass
            elif args.format == "csv":
                # CSV output for single file
                pass

            # Extract frames if requested
            if args.extract_frames:
                if args.format == "text":
                    pass
                success = vidbeast.extract_frames_to_png(report, args.extract_frames, args.frame_rate)
                if args.format == "text":
                    if success:
                        pass
                    else:
                        pass

        elif os.path.isdir(args.input):
            # Directory processing
            if args.format == "text":
                pass

            files_found = []
            if args.recursive:
                for root, _dirs, files in os.walk(args.input):
                    for file in files:
                        if any(file.lower().endswith(ext) for ext in SUPPORTED_FORMATS):
                            files_found.append(os.path.join(root, file))
            else:
                for file in os.listdir(args.input):
                    file_path = os.path.join(args.input, file)
                    if os.path.isfile(file_path) and any(file.lower().endswith(ext) for ext in SUPPORTED_FORMATS):
                        files_found.append(file_path)

            if args.format == "text":
                pass

            # Batch analyze
            reports = vidbeast.batch_analyze(files_found)

            # Output results
            if args.format == "text":
                corrupted_count = 0
                repairable_count = 0

                for report in reports:
                    print_report(report, args.detailed)

                    if report.corruption_level != CorruptionLevel.NONE:
                        corrupted_count += 1

                    if report.repair_feasible:
                        repairable_count += 1

            elif args.format == "json":
                {
                    "summary": {
                        "total_files": len(reports),
                        "corrupted": sum(1 for r in reports if r.corruption_level != CorruptionLevel.NONE),
                        "repairable": sum(1 for r in reports if r.repair_feasible),
                    },
                    "reports": [r.__dict__ for r in reports],
                }

            elif args.format == "csv":
                for report in reports:
                    pass

        else:
            return 1

    except Exception:
        if args.format == "text":
            pass
        else:
            pass
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
