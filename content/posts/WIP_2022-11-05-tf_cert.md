---
title:  "tf_cert"
excerpt: "tf_cert"
toc: true
toc_sticky: true

categories:
  - tech
tags:
  - tf_cert

last_modified_at: 2022-11-05T00:00:00-00:00
---

# 공통

## tensorflow datasets API

```python
import tensorflow_datasets as tfds

tfds.list_builders()  # 데이터셋 종류 확인
dataset, info = tfds.load(name='dataset name', split=tfds.Split.TRAIN, suffle_files=True, with_info=True)

# 데이터 셋 사이즈
info.split['train'].num_examples

train_ds, test_ds = tfds.load('dataset name', split=['train', 'test'])

# return 되는 데이터는 dict 형식
for data in datset.take(1):
    plt.imshow(data['image'])
    print(data['label'].numpy())

# tuple 형식 사용
dataset, info = tfds.load(name='dataset name', as_supervised=True, split=tfds.Split.TRAIN, suffle_files=True,
                          with_info=True)
for data, label in dataset:
    s.numpy().decode('utf8')


# 함수 적용
def normalize(dataset):
    image, label = tf.cast(dataset['image'], tf.float32) / 255.0, dataset['label']
    return image, label


train_dataset = dataset.map(normalize).shuffle(buffer_size=1000).batch(32)

# 학습 로그
history = model.fit(train_dataset, epochs=num_epochs, validation_data=test_dataset)
import matplotlib.pyplot as plt


def plot_graphs(history, string):
    plt.plot(history.history[string])
    plt.plot(history.history['val_' + string])
    plt.xlabel("Epochs")
    plt.ylabel(string)
    plt.legend([string, 'val_' + string])
    plt.show()


plot_graphs(history, "accuracy")
plot_graphs(history, "loss")
```

## Pre-trained model

## Callback, Save, Load

# NLP

## Data & Pre-processing

```python
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import csv
import json

# csv read
with open('csv_path.csv', 'r') as f:
    reader = csv.reader(f, delimiter=',')

# json read
with open('json_path.json', 'r') as f:
    datastore = json.load(f)

tokenizer = Tokenizer(num_words=100, oov_token="<OOV>")
tokenizer.fit_on_texts(sentences)
word_index = tokenizer.word_index

sequences = tokenizer.texts_to_sequences(sentences)
padded = pad_sequences(sequences, maxlen=5, padding='post', truncating='post')

# create predictors and label
xs, labels = input_sequences[:, :-1], input_sequences[:, -1]
ys = tf.keras.utils.to_categorical(labels, num_classes=total_words)
```

## Text Classification

```python
# base model
model = tf.keras.Sequential([
    tf.keras.layers.Embedding(vocab_size, embedding_dim, input_length=max_length),
    tf.keras.layers.GlobalAveragePooling1D(),  # tf.keras.layers.Flatten()
    tf.keras.layers.Dense(24, activation='relu'),
    tf.keras.layers.Dense(6, activation='softmax')
])

# model compile & training
model.compile(loss='sparse_categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
history = model.fit(train_padded, training_label_seq, epochs=num_epochs,
                    validataion_data=(validation_padded, validation_label_seq), verbose=2)

# single layer LSTM
model = tf.keras.Sequential([
    tf.keras.layers.Embedding(tokenizer.vocab_size, embedding_dim),
    tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(lstm_dim)),
    tf.keras.layers.Dense(dense_dim, activation='relu'),
    tf.keras.layers.Dense(1, activation='sigmoid')
])

# multiple layer LSTM
model = tf.keras.Sequential([
    tf.keras.layers.Embedding(tokenizer.vocab_size, embedding_dim),
    tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(lstm1_dim, return_sequences=True)),
    tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(lstm2_dim)),
    tf.keras.layers.Dense(dense_dim, activation='relu'),
    tf.keras.layers.Dense(1, activation='sigmoid')
])

# GRU
model_gru = tf.keras.Sequential([
    tf.keras.layers.Embedding(vocab_size, embedding_dim, input_length=max_length),
    tf.keras.layers.Bidirectional(tf.keras.layers.GRU(gru_dim)),
    tf.keras.layers.Dense(dense_dim, activation='relu'),
    tf.keras.layers.Dense(1, activation='sigmoid')
])

# Model Definition with Conv1D
model = tf.keras.Sequential([
    tf.keras.layers.Embedding(tokenizer.vocab_size, embedding_dim),
    tf.keras.layers.Conv1D(filters=filters, kernel_size=kernel_size, activation='relu'),
    tf.keras.layers.GlobalMaxPooling1D(),  # tf.keras.layers.GlobalAveragePooling1D(),
    tf.keras.layers.Dense(dense_dim, activation='relu'),
    tf.keras.layers.Dense(1, activation='sigmoid')
])
```

## Text Generation
```python
# Initialize the sequences list
input_sequences = []

# Loop over every line
for line in corpus:

	# Tokenize the current line
	token_list = tokenizer.texts_to_sequences([line])[0]

	# Loop over the line several times to generate the subphrases
	for i in range(1, len(token_list)):
		
		# Generate the subphrase
		n_gram_sequence = token_list[:i+1]

		# Append the subphrase to the sequences list
		input_sequences.append(n_gram_sequence)

# Get the length of the longest line
max_sequence_len = max([len(x) for x in input_sequences])

# Pad all sequences
input_sequences = np.array(pad_sequences(input_sequences, maxlen=max_sequence_len, padding='pre'))

# Create inputs and label by splitting the last token in the subphrases
xs, labels = input_sequences[:,:-1],input_sequences[:,-1]

# Convert the label into one-hot arrays
ys = tf.keras.utils.to_categorical(labels, num_classes=total_words)

model = Sequential([
          Embedding(total_words, 64, input_length=max_sequence_len-1),
          Bidirectional(LSTM(20)),
          Dense(total_words, activation='softmax')
])

# Use categorical crossentropy because this is a multi-class problem
model.compile(loss='categorical_crossentropy', 
              optimizer=tf.keras.optimizers.Adam(learning_rate),
              metrics=['accuracy'])

# Define the total words. You add 1 for the index `0` which is just the padding token.
total_words = len(tokenizer.word_index) + 1

# train the model
history = model.fit(xs, ys, epochs)
```



# Sequence Model
