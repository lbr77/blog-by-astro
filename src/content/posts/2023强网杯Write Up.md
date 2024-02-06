---
title: 2023强网杯Write up
date: 2023-12-28
tags:
  - 技术
excerpt: 强网杯部分wp
slug: 2023-qwb
---



## Misc

### 1.签到

`flag{welcome_to_qwb_2023}`

### 2.SpeedUp

```python
def f(x):
    res = 0
    while x:
        res += x % 10
        x //= 10
    return res


fac_mem = [1]


def fac(x):
    if x < len(fac_mem):
        return fac_mem[x]
    else:
        res = fac_mem[-1]
        for i in range(len(fac_mem), x + 1):
            res *= i
            fac_mem.append(res)
        return res


pow_mem = [1]


def pow(x):
    if x < len(pow_mem):
        return pow_mem[x]
    else:
        res = pow_mem[-1]
        for i in range(len(pow_mem), x + 1):
            res *= 2
            pow_mem.append(res)
        return res


for i in range(0, 7):
    print(f(fac(pow(i))), end=",")
```

https://oeis.org/A244060/list

找到数列直接算sha256即可

### 3.Wabby Wabbo Radio

看网页找到好几个Wav文件

播放发现有摩斯电码声音

```jsx
hint1: -.. --- -.-- --- ..- -.- -. --- .-- --.- .- -- ..--..
hint2: -- .- -.-- -... . ..-. .-.. .- --. .. ... .--. -. --. .--. .. -.-. - ..- .-. .
```

翻译之后是

```jsx
DOYOUKNOWQAM?
MAYBEFLAGISPNGPICTURE
```

QAM解码

flag文件是无损的16QAM编码

写个程序复原即可.

注意需要用png头辅助映射一下.

```python
import numpy as np
from scipy.io import wavfile
import binascii

rate, audio = wavfile.read("flag.wav")
left_channel = audio[:, 0]
right_channel = audio[:, 1]


complex = left_channel + 1j * right_channel
constellation = { #手动映射真好玩
    (-3 - 3j): "0",
    (-3 - 1j): "1",
    (-3 + 3j): "3",
    (-3 + 1j): "2",
    (-1 - 3j): "4",
    (-1 - 1j): "5",
    (-1 + 3j): "7",
    (-1 + 1j): "6",
    (3 - 3j): "c",
    (3 - 1j): "d",
    (3 + 3j): "f",
    (3 + 1j): "e",
    (1 - 3j): "8",
    (1 - 1j): "9",
    (1 + 3j): "b",
    (1 + 1j): "a",
}


def demodulate_16QAM(signal):
    demodulated_bits = ""
    for s in signal:
        closest_point = min(constellation.keys(), key=lambda point: np.abs(point - s))
        demodulated_bits += constellation[closest_point]
    return demodulated_bits


a = demodulate_16QAM(complex)
open("out.png", "wb").write(binascii.unhexlify(a))
```

### 4.谍影重重2.0

24位数据是icao code（6个十六进制）

https://mode-s.org/decode/content/ads-b/1-basics.html

```python
import pyModeS as pms
pms.tell("")
```

大写然后计算md5即可。