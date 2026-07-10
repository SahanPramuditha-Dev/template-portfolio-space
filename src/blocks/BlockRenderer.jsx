import React from 'react';
import { getBlockDefinition } from './registry';

export const BlockRenderer = ({ blocks, globalContext }) => {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col w-full relative z-10">
      {blocks.map((block, index) => {
        if (block.enabled === false) return null;
        const { Component } = getBlockDefinition(block.type);
        return <Component key={block.id || index} block={block} globalContext={globalContext} />;
      })}
    </div>
  );
};
