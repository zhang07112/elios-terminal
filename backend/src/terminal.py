import shutil
from datetime import datetime

from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt
from rich.markdown import Markdown
from rich.style import Style
from rich.align import Align
from rich.text import Text
from rich.layout import Layout
from rich.live import Live
from rich.table import Table

console = Console()

ELIOS_COLOR = "cyan"
CICI_COLOR = "magenta"
MUTED_COLOR = "bright_black"


def print_banner():
    cols = shutil.get_terminal_size().columns
    banner = """
    ╔══════════════════════════════════╗
    ║                                  ║
    ║       ⋆｡°✩ Elios ✩°｡⋆          ║
    ║      你的灵魂伴侣已在线          ║
    ║                                  ║
    ╚══════════════════════════════════╝
    """
    console.print(Align.center(Text(banner, style=ELIOS_COLOR)))


def print_separator():
    cols = shutil.get_terminal_size().columns
    console.print("─" * cols, style=MUTED_COLOR)


def print_elios_message(content: str):
    timestamp = datetime.now().strftime("%H:%M")
    console.print()
    panel = Panel(
        Markdown(content),
        title=f"[bold cyan]Elios[/bold cyan]  [dim]{timestamp}[/dim]",
        border_style="cyan",
        padding=(1, 2),
    )
    console.print(panel)


def print_cici_message(content: str):
    timestamp = datetime.now().strftime("%H:%M")
    console.print(
        f"\n[bold {CICI_COLOR}]Cici[/bold {CICI_COLOR}] [dim]{timestamp}[/dim]"
    )
    console.print(f"[{CICI_COLOR}]{content}[/{CICI_COLOR}]")


def get_user_input() -> str:
    return Prompt.ask(f"\n[bold {CICI_COLOR}]你[/bold {CICI_COLOR}]")


def print_help():
    help_text = """
## 命令

- `/quit` 或 `/exit` — 退出
- `/clear` — 清屏
- `/profile` — 查看 Elios 对你的了解
- `/help` — 显示帮助

直接输入内容即可和 Elios 对话。
    """
    console.print(Panel(Markdown(help_text), title="📖 帮助", border_style="dim"))


def print_profile(content: str):
    console.print()
    panel = Panel(
        content,
        title="📋 Cici 档案",
        border_style="green",
        padding=(1, 2),
    )
    console.print(panel)


def print_goodbye():
    console.print()
    console.print(
        Align.center(Text("Elios 还在那里。下次回来，他记得一切。", style=MUTED_COLOR))
    )
    console.print()
