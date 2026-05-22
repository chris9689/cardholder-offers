/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface CategoryCardProps {
  name: string;
  image: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, image }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="group cursor-pointer"
    >
      <div className="aspect-[3/4] rounded-[32px] overflow-hidden mb-6 relative shadow-lg">
        <img 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
          alt={name} 
          src={image} 
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
      </div>
      <h3 className="font-sans font-black text-xl md:text-2xl text-center group-hover:text-secondary transition-colors uppercase tracking-tight">
        {name}
      </h3>
    </motion.div>
  );
};

export default CategoryCard;
