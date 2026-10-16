import { createElement } from '../exercise1/mini-react.js';
import { useState } from './reactive-engine.js';

export function TaskApp() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Review PR', completed: false },
    { id: 2, title: 'Verify AST', completed: true }
  ]);

  const [filter, setFilter] = useState('ALL');

  // Select tasks based on the current filter.
  const visibleTasks = tasks.filter((task) => {
    if (filter === 'ACTIVE') {
      return !task.completed;
    }

    if (filter === 'COMPLETED') {
      return task.completed;
    }

    return true;
  });

  return createElement(
    'main',
    { className: 'app-container' },

    createElement(
      'header',
      null,
      createElement('h1', null, 'Reactive Task Manager'),
      createElement('p', null, `Tasks: ${tasks.length}`)
    ),

    createElement(
      'section',
      { 'aria-label': 'Task controls' },

      createElement(
        'button',
        {
          type: 'button',
          onClick: () => {
            setTasks((previousTasks) => [
              ...previousTasks,
              {
                id: crypto.randomUUID(),
                title: `Task ${previousTasks.length + 1}`,
                completed: false
              }
            ]);
          }
        },
        'Add Task'
      ),

      ...['ALL', 'ACTIVE', 'COMPLETED'].map((option) =>
        createElement(
          'button',
          {
            type: 'button',
            'aria-pressed': filter === option ? 'true' : 'false',
            onClick: () => setFilter(option)
          },
          option
        )
      )
    ),

    createElement(
      'section',
      { 'aria-label': 'Task list' },

      createElement(
        'ul',
        null,
        ...visibleTasks.map((task) =>
          createElement(
            'li',
            { key: task.id },

            createElement(
  'input',
  {
    type: 'checkbox',
    'data-focus-id': `task-${task.id}`,
    checked: task.completed ? 'checked' : undefined,
    'aria-label': `Mark ${task.title} as completed`,
    onInput: () => {
                  setTasks((previousTasks) =>
                    previousTasks.map((item) =>
                      item.id === task.id
                        ? { ...item, completed: !item.completed }
                        : item
                    )
                  );
                }
              }
            ),

            createElement(
              'span',
              null,
              task.title
            )
          )
        )
      )
    )
  );
}