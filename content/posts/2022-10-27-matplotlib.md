---
title:  "matplotlib"
date: "2022-10-27"
teaser: "python matplotlib 사용하기"
tags:
  - todo
---

# Case 1: subplot을 미리 설정
```python
fig, axs = plt.subplots(2, 1, constrained_layout=True)
fig.suptitle('This is a somewhat long figure title', fontsize=16)

axs[0].plot(t1, f(t1), 'o', t2, f(t2), '-')
axs[0].set_title('subplot 1')
axs[0].set_xlabel('distance (m)')
axs[0].set_ylabel('Damped oscillation')

axs[1].plot(t3, np.cos(2*np.pi*t3), '--')
axs[1].set_xlabel('time (s)')
axs[1].set_title('subplot 2')
axs[1].set_ylabel('Undamped')

plt.show()
```

# Case 2: subplot을 추가하면서 설정
```python
ax = []

for i in range(columns*rows):
    img = np.random.randint(10, size=(h,w))
    ax.append(fig.add_subplot(rows, columns, i+1))
    ax[-1].set_title("ax:"+str(i))  # set title
    plt.imshow(img, alpha=0.25)

plt.show()  # finally, render the plot
```

# subplot간 space 조정
```python
plt.subplots_adjust(left=0.125, bottom=0.1, right=0.9, top=0.9, wspace=0.2, hspace=0.2)
```